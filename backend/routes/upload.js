import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';

import { extractTextFromPdf, chunkText } from '../services/pdf.js';
import { embedTexts } from '../services/embeddings.js';
import { upsertVectors } from '../services/pinecone.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const EMBED_BATCH_SIZE = Number(process.env.EMBEDDING_BATCH_SIZE || 64);

async function embedInBatches(chunks) {
  const vectors = [];
  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
    const embeddings = await embedTexts(batch.map((chunk) => chunk.text));
    embeddings.forEach((values, idx) => {
      const chunk = batch[idx];
      vectors.push({ chunk, values });
    });
  }
  return vectors;
}

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    const text = await extractTextFromPdf(req.file.buffer);
    const chunks = chunkText(text, Number(process.env.CHUNK_SIZE || 1500), Number(process.env.CHUNK_OVERLAP || 200));
    if (!chunks.length) {
      return res.status(422).json({ error: 'No chunks could be derived from PDF' });
    }

    const docId = randomUUID();
    const namespace = req.body?.namespace || docId;
    const vectorsWithMetadata = await embedInBatches(chunks);
    const vectors = vectorsWithMetadata.map(({ chunk, values }, idx) => ({
      id: `${docId}-${chunk.id}-${idx}`,
      values,
      metadata: {
        text: chunk.text,
        source: req.file.originalname,
        docId,
      },
    }));

    await upsertVectors(vectors, namespace);

    return res.json({
      message: 'PDF ingested successfully',
      docId,
      namespace,
      chunksIndexed: vectors.length,
    });
  } catch (error) {
    console.error('Upload error', error);
    return res.status(500).json({ error: error.message || 'Failed to ingest PDF' });
  }
});

export default router;
