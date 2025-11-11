import express from 'express';
import cors from 'cors';
import './config/env.js';
import uploadRoute from './routes/upload.js';
import chatRoute from './routes/chat.js';
import langchainUploadRoute from './routes/langchain-upload.js';
import langchainQueryRoute from './routes/langchain-query.js';

const REQUIRED = ['OPENAI_API_KEY', 'PINECONE_API_KEY', 'PINECONE_INDEX_NAME'];
REQUIRED.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Warning: ${key} is not set. API routes will fail until it is provided.`);
  }
});

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Original routes (without LangChain)
app.use('/api/upload', uploadRoute);
app.use('/api/query', chatRoute);

// LangChain routes (with RecursiveCharacterTextSplitter and RAG)
app.use('/api/langchain/upload', langchainUploadRoute);
app.use('/api/langchain/query', langchainQueryRoute);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
