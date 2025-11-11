import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = process.env.ENV_PATH || path.resolve(__dirname, '../.env.local');

// Only load from the specific .env.local file, with override enabled
dotenv.config({ path: envPath, override: true });

export const env = {
  cohereApiKey: process.env.COHERE_API_KEY,
  pineconeApiKey: process.env.PINECONE_API_KEY,
  pineconeIndexName: process.env.PINECONE_INDEX_NAME,
  pineconeCloud: process.env.PINECONE_CLOUD || 'aws',
  pineconeRegion: process.env.PINECONE_REGION || 'us-east-1',
  embeddingDimensions: Number(process.env.EMBEDDING_DIMENSIONS || 1024),
};

export function requireEnv(keys = []) {
  keys.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`${key} is required but missing`);
    }
  });
}
