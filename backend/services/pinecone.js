import { Pinecone } from '@pinecone-database/pinecone';

import { env, requireEnv } from '../config/env.js';

requireEnv(['PINECONE_API_KEY', 'PINECONE_INDEX_NAME']);

const pinecone = new Pinecone({ apiKey: env.pineconeApiKey });
const INDEX_NAME = env.pineconeIndexName;
const INDEX_DIMENSION = env.embeddingDimensions;
const SERVERLESS_CLOUD = env.pineconeCloud;
const SERVERLESS_REGION = env.pineconeRegion;

async function waitForIndexReady(name, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const description = await pinecone.describeIndex({ indexName: name });
    const status = description.status || {};
    if (status.ready) return;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(`Pinecone index ${name} not ready after ${timeoutMs}ms`);
}

async function ensureIndexReady() {
  const existing = await pinecone.listIndexes();
  const alreadyExists = existing.indexes?.some((idx) => idx.name === INDEX_NAME);
  if (!alreadyExists) {
    await pinecone.createIndex({
      name: INDEX_NAME,
      dimension: INDEX_DIMENSION,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: SERVERLESS_CLOUD,
          region: SERVERLESS_REGION,
        },
      },
    });
  }
  await waitForIndexReady(INDEX_NAME);
  return pinecone.Index(INDEX_NAME);
}

let cachedIndex = null;

async function getIndex() {
  if (cachedIndex) return cachedIndex;
  cachedIndex = await ensureIndexReady();
  return cachedIndex;
}

export async function upsertVectors(vectors, namespace) {
  if (!Array.isArray(vectors) || !vectors.length) return;
  const index = await getIndex();
  await index.upsert(vectors, namespace ? { namespace } : undefined);
}

export async function queryVectors(vector, namespace, topK = 5) {
  const index = await getIndex();
  return index.query({
    vector,
    topK,
    includeMetadata: true,
    namespace,
  });
}
