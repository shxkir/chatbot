export const env = {
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  pineconeApiKey: process.env.PINECONE_API_KEY ?? '',
  pineconeIndexName: process.env.PINECONE_INDEX_NAME ?? '',
  pineconeCloud: process.env.PINECONE_CLOUD ?? 'aws',
  pineconeRegion: process.env.PINECONE_REGION ?? 'us-east-1',
  embeddingDimensions: Number(process.env.EMBEDDING_DIMENSIONS ?? 1536),
  functionsRegion: process.env.FUNCTIONS_REGION ?? 'us-central1',
};

export function assertEnv() {
  const missing = Object.entries(env)
    .filter(([, value]) => value === '' || value === undefined || value === null || Number.isNaN(value))
    .map(([key]) => key);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
