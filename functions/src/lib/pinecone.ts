import { Pinecone } from '@pinecone-database/pinecone';

import { env } from './env';

const pinecone = new Pinecone({
  apiKey: env.pineconeApiKey,
});

export async function getIndex() {
  return pinecone.Index(env.pineconeIndexName);
}
