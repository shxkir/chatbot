import { CohereEmbeddings } from '@langchain/cohere';
import { ChatCohere } from '@langchain/cohere';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PromptTemplate } from '@langchain/core/prompts';
import pdfParse from 'pdf-parse';

import { env, requireEnv } from '../config/env.js';

requireEnv(['COHERE_API_KEY', 'PINECONE_API_KEY', 'PINECONE_INDEX_NAME']);

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: env.pineconeApiKey,
});

// Initialize Cohere embeddings
const embeddings = new CohereEmbeddings({
  apiKey: env.cohereApiKey,
  model: process.env.COHERE_EMBED_MODEL || 'embed-english-v3.0',
});

// Initialize Cohere Chat
const chatModel = new ChatCohere({
  apiKey: env.cohereApiKey,
  model: process.env.COHERE_CHAT_MODEL || 'command-r7b-12-2024',
  temperature: 0.2,
});

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPdf(buffer) {
  if (!buffer?.length) {
    throw new Error('No PDF buffer received');
  }
  const data = await pdfParse(buffer);
  if (!data?.text?.trim()) {
    throw new Error('Unable to extract text from PDF');
  }
  return data.text;
}

/**
 * Process PDF and store in Pinecone using LangChain
 */
export async function processPdfWithLangChain(pdfBuffer, fileName) {
  // 1. Extract text from PDF
  const text = await extractTextFromPdf(pdfBuffer);

  // 2. Split text into chunks using RecursiveCharacterTextSplitter
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: Number(process.env.CHUNK_SIZE || 1500),
    chunkOverlap: Number(process.env.CHUNK_OVERLAP || 200),
  });

  const docs = await textSplitter.createDocuments([text], [
    {
      source: fileName,
      timestamp: new Date().toISOString(),
    },
  ]);

  // 3. Create namespace with pdf_<timestamp> format
  const namespace = `pdf_${Date.now()}`;

  // 4. Get Pinecone index
  const pineconeIndex = pinecone.Index(env.pineconeIndexName);

  // 5. Create embeddings and store in Pinecone using LangChain
  await PineconeStore.fromDocuments(docs, embeddings, {
    pineconeIndex,
    namespace,
    textKey: 'text',
  });

  return {
    namespace,
    chunksIndexed: docs.length,
    fileName,
  };
}

/**
 * Query Pinecone and get ChatGPT response using RAG
 */
export async function queryWithRAG(question, namespace) {
  // 1. Get Pinecone index
  const pineconeIndex = pinecone.Index(env.pineconeIndexName);

  // 2. Create vector store from existing index
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace,
    textKey: 'text',
  });

  // 3. Perform similarity search
  const topK = Number(process.env.RETRIEVAL_TOP_K || 5);
  const results = await vectorStore.similaritySearchWithScore(question, topK);

  if (!results.length) {
    return {
      reply: 'No relevant context found for that question.',
      references: [],
    };
  }

  // 4. Build context from search results
  const context = results
    .map((result, idx) => {
      const [doc, score] = result;
      return `[Snippet ${idx + 1}, relevance: ${score.toFixed(3)}]\n${doc.pageContent}`;
    })
    .join('\n\n---\n\n');

  // 5. Create RAG prompt template
  const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful assistant that answers questions based only on the provided context from a PDF document.

Context from the document:
{context}

Question: {question}

Instructions:
- Answer the question using ONLY the information from the context above
- If the context doesn't contain enough information to answer the question, say so clearly
- Be concise and accurate
- Cite which snippet(s) you used in your answer

Answer:`);

  const formattedPrompt = await promptTemplate.format({
    context,
    question,
  });

  // 6. Get ChatGPT response
  const response = await chatModel.invoke(formattedPrompt);

  // 7. Format references
  const references = results.map((result, idx) => {
    const [doc, score] = result;
    return {
      rank: idx + 1,
      score,
      textPreview: doc.pageContent.slice(0, 200),
      source: doc.metadata?.source || 'unknown',
    };
  });

  return {
    reply: response.content,
    references,
  };
}

/**
 * Get Pinecone index stats
 */
export async function getPineconeStats(namespace = null) {
  try {
    const pineconeIndex = pinecone.Index(env.pineconeIndexName);
    const stats = await pineconeIndex.describeIndexStats();

    if (namespace) {
      return {
        namespace,
        vectorCount: stats.namespaces?.[namespace]?.vectorCount || 0,
      };
    }

    return stats;
  } catch (error) {
    console.error('Error getting Pinecone stats:', error);
    return null;
  }
}
