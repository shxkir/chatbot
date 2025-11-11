import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local'), override: true });

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

async function createIndex() {
  try {
    console.log('Creating Pinecone index: pdf-chatbot...');

    await pinecone.createIndex({
      name: 'pdf-chatbot',
      dimension: 1024, // Cohere embed-english-v3.0 embedding dimensions
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
    });

    console.log('✅ Index "pdf-chatbot" created successfully!');
    console.log('Please wait a minute for the index to be ready, then try uploading a PDF.');
  } catch (error) {
    if (error.message?.includes('ALREADY_EXISTS')) {
      console.log('✅ Index "pdf-chatbot" already exists!');
    } else {
      console.error('❌ Error creating index:', error.message);
    }
  }
}

createIndex();
