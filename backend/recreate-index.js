import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local'), override: true });

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

async function recreateIndex() {
  const indexName = 'pdf-chatbot';

  try {
    // Step 1: Try to delete the old index
    console.log(`Deleting old index "${indexName}" if it exists...`);
    try {
      await pinecone.deleteIndex(indexName);
      console.log('✅ Old index deleted successfully!');
      console.log('⏳ Waiting 10 seconds for deletion to complete...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (error) {
      if (error.message?.includes('NOT_FOUND') || error.status === 404) {
        console.log('ℹ️  No existing index found, proceeding to create new one...');
      } else {
        throw error;
      }
    }

    // Step 2: Create new index with 1024 dimensions (for Cohere)
    console.log(`\nCreating new Pinecone index "${indexName}" with 1024 dimensions...`);
    await pinecone.createIndex({
      name: indexName,
      dimension: 1024, // Cohere embed-english-v3.0 dimensions
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
    });

    console.log('✅ Index "pdf-chatbot" created successfully with 1024 dimensions!');
    console.log('⏳ Please wait about 1 minute for the index to be ready, then try uploading a PDF.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

recreateIndex();
