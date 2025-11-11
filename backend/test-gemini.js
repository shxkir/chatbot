import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local'), override: true });

console.log('Testing Google Gemini API...');
console.log('API Key:', process.env.GOOGLE_API_KEY ? `${process.env.GOOGLE_API_KEY.substring(0, 10)}...` : 'NOT SET');

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'embedding-001',
});

async function test() {
  try {
    console.log('\nCreating test embedding for "Hello world"...');
    const start = Date.now();
    const result = await embeddings.embedQuery('Hello world');
    const duration = Date.now() - start;

    console.log(`✅ Success! Embedding created in ${duration}ms`);
    console.log(`Embedding dimensions: ${result.length}`);
    console.log(`First 5 values: [${result.slice(0, 5).join(', ')}]`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

test();
