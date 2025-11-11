import Busboy from 'busboy';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import type { Request, Response } from 'firebase-functions/v2/https';
import { v4 as uuidv4 } from 'uuid';

import { firestore, storage } from './lib/firebase';
import { getUserFromRequest } from './lib/auth';
import { assertEnv, env } from './lib/env';
import { extractTextFromPdf, chunkText } from './lib/pdf';
import { embedTexts, generateChatResponse } from './lib/openai';
import { getIndex } from './lib/pinecone';
import type { DocumentMetadata, RagChatRequest, RagChatResponse } from './types';

assertEnv();
setGlobalOptions({
  region: env.functionsRegion,
  maxInstances: 5,
  memory: '4GiB',
  timeoutSeconds: 540,
});

type UploadedFilePayload = {
  docId?: string;
  fileName: string;
  storagePath: string;
  downloadUrl: string;
};

const documentsCollection = firestore.collection('documents');

function enableCors(req: Request, res: Response) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'authorization,content-type');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true;
  }
  return false;
}

async function getOrCreateDownloadUrl(storagePath: string) {
  const file = storage.bucket().file(storagePath);
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24, // 24h
  });
  return url;
}

async function ensureOwnership(docId: string, uid: string) {
  const snapshot = await documentsCollection.doc(docId).get();
  if (!snapshot.exists) {
    throw new HttpsError('not-found', `Document ${docId} does not exist.`);
  }
  const data = snapshot.data() as DocumentMetadata;
  if (data.ownerId !== uid) {
    throw new HttpsError('permission-denied', 'You do not own this document.');
  }
  return { snapshot, data };
}

async function generateEmbeddingsInternal(texts: string[]) {
  const batchSize = Number(process.env.EMBEDDING_BATCH_SIZE ?? 32);
  const vectors: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const embeddings = await embedTexts(batch);
    vectors.push(...embeddings);
  }
  return vectors;
}

async function queryPineconeInternal(vector: number[], namespace: string, topK: number) {
  const index = await getIndex();
  const response = await index.query({
    vector,
    namespace,
    topK,
    includeValues: false,
    includeMetadata: true,
  });
  return response.matches || [];
}

async function handleMultipartUpload(req: Request, ownerId: string) {
  const docId = uuidv4();
  return new Promise<UploadedFilePayload>((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const buffers: Buffer[] = [];
    let fileName = `upload-${Date.now()}.pdf`;
    let mimeType = 'application/pdf';

    busboy.on('file', (_fieldName, file, info) => {
      fileName = info.filename || fileName;
      mimeType = info.mimeType || mimeType;
      file.on('data', (data) => buffers.push(data));
      file.on('limit', () => reject(new HttpsError('invalid-argument', 'Uploaded file exceeds size limits.')));
    });

    busboy.on('finish', async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        const storagePath = `uploads/${ownerId}/${docId}-${fileName}`;
        await storage.bucket().file(storagePath).save(pdfBuffer, {
          metadata: { contentType: mimeType },
        });
        const downloadUrl = await getOrCreateDownloadUrl(storagePath);
        resolve({ docId, fileName, storagePath, downloadUrl });
      } catch (error) {
        reject(error);
      }
    });

    busboy.on('error', reject);
    const rawBody = req.rawBody ?? Buffer.alloc(0);
    busboy.end(rawBody);
  });
}

export const uploadFile = onRequest(async (req, res) => {
  if (enableCors(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const user = await getUserFromRequest(req);
    const ownerId = user.uid;
    const contentType = req.headers['content-type'] || '';

    let payload: UploadedFilePayload | null = null;

    if (contentType.includes('multipart/form-data')) {
      payload = await handleMultipartUpload(req, ownerId);
    } else {
      const { fileName, storagePath, downloadUrl } = req.body as Partial<UploadedFilePayload>;
      if (!storagePath || !fileName) {
        throw new HttpsError('invalid-argument', 'fileName and storagePath are required.');
      }
      const file = storage.bucket().file(storagePath);
      const [exists] = await file.exists();
      if (!exists) {
        throw new HttpsError('not-found', 'File not found in Firebase Storage.');
      }
      payload = {
        fileName,
        storagePath,
        downloadUrl: downloadUrl || (await getOrCreateDownloadUrl(storagePath)),
      };
    }

    const docId = payload.docId ?? uuidv4();
    const namespace = `doc-${docId}`;
    const now = FieldValue.serverTimestamp();
    const metadata: DocumentMetadata = {
      docId,
      ownerId,
      fileName: payload.fileName,
      storagePath: payload.storagePath,
      downloadUrl: payload.downloadUrl,
      namespace,
      status: 'uploaded',
      createdAt: now,
      updatedAt: now,
    };

    await documentsCollection.doc(docId).set(metadata, { merge: true });

    res.json({
      docId,
      namespace,
      storagePath: payload.storagePath,
      downloadUrl: payload.downloadUrl,
    });
  } catch (error) {
    console.error('uploadFile error', error);
    const message = error instanceof Error ? error.message : 'Failed to upload file';
    res.status(500).json({ error: message });
  }
});

export const processPDF = onRequest(async (req, res) => {
  if (enableCors(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const user = await getUserFromRequest(req);
    const { docId } = req.body as { docId: string };
    if (!docId) {
      throw new HttpsError('invalid-argument', 'docId is required.');
    }

    const { snapshot, data } = await ensureOwnership(docId, user.uid);
    const file = storage.bucket().file(data.storagePath);
    const [pdfBuffer] = await file.download();

    await snapshot.ref.update({ status: 'processing', updatedAt: FieldValue.serverTimestamp() });

    const text = await extractTextFromPdf(pdfBuffer);
    const chunks = chunkText(text);
    if (!chunks.length) {
      throw new HttpsError('failed-precondition', 'Unable to derive text chunks from PDF.');
    }

    const embeddings = await generateEmbeddingsInternal(chunks.map((chunk) => chunk.text));
    const vectors = embeddings.map((values, idx) => ({
      id: `${docId}-${idx}`,
      values,
      metadata: {
        docId,
        chunkId: chunks[idx].id,
        text: chunks[idx].text,
        fileName: data.fileName,
      },
    }));

    const index = await getIndex();
    await index.upsert(vectors, { namespace: data.namespace });

    await snapshot.ref.update({
      status: 'ready',
      chunksIndexed: vectors.length,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({ docId, chunksIndexed: vectors.length, namespace: data.namespace });
  } catch (error) {
    console.error('processPDF error', error);
    const message = error instanceof Error ? error.message : 'Failed to process PDF';
    res.status(500).json({ error: message });
  }
});

export const generateEmbeddings = onRequest(async (req, res) => {
  if (enableCors(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await getUserFromRequest(req);
    const { texts } = req.body as { texts: string[] };
    if (!Array.isArray(texts) || !texts.length) {
      throw new HttpsError('invalid-argument', 'texts array is required.');
    }

    const embeddings = await generateEmbeddingsInternal(texts);
    res.json({ embeddings });
  } catch (error) {
    console.error('generateEmbeddings error', error);
    const message = error instanceof Error ? error.message : 'Failed to generate embeddings';
    res.status(500).json({ error: message });
  }
});

export const queryPinecone = onRequest(async (req, res) => {
  if (enableCors(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const user = await getUserFromRequest(req);
    const { docId, vector, topK } = req.body as { docId: string; vector: number[]; topK?: number };
    if (!docId || !Array.isArray(vector) || !vector.length) {
      throw new HttpsError('invalid-argument', 'docId and vector are required.');
    }
    const { data } = await ensureOwnership(docId, user.uid);
    const matches = await queryPineconeInternal(vector, data.namespace, Number(topK) || 5);
    res.json({ matches });
  } catch (error) {
    console.error('queryPinecone error', error);
    const message = error instanceof Error ? error.message : 'Failed to query Pinecone';
    res.status(500).json({ error: message });
  }
});

export const ragChat = onRequest(async (req, res) => {
  if (enableCors(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const user = await getUserFromRequest(req);
    const { docId, question, topK } = req.body as RagChatRequest & { topK?: number };
    if (!docId || !question) {
      throw new HttpsError('invalid-argument', 'docId and question are required.');
    }
    const { data } = await ensureOwnership(docId, user.uid);

    const [queryEmbedding] = await generateEmbeddingsInternal([question]);
    const matches = await queryPineconeInternal(queryEmbedding, data.namespace, Number(topK) || 5);

    if (!matches.length) {
      const emptyResponse: RagChatResponse = {
        reply: 'No relevant context found for that question.',
        references: [],
      };
      res.json(emptyResponse);
      return;
    }

    const context = matches
      .map((match, idx) => `Snippet ${idx + 1}: ${match.metadata?.text ?? ''}`)
      .join('\n\n');

    const reply = await generateChatResponse([
      {
        role: 'system',
        content: 'You are a helpful assistant that only uses the provided context snippets to answer questions.',
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}\nAnswer using only the context above.`,
      },
    ]);

    const response: RagChatResponse = {
      reply,
      references: matches.map((match, idx) => ({
        rank: idx + 1,
        score: match.score,
        textPreview: (match.metadata?.text as string)?.slice(0, 200) ?? '',
      })),
    };

    res.json(response);
  } catch (error) {
    console.error('ragChat error', error);
    const message = error instanceof Error ? error.message : 'Failed to complete RAG chat request';
    res.status(500).json({ error: message });
  }
});
