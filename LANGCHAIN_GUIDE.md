# LangChain PDF-RAG Chatbot - Complete Guide

## Overview

This is a complete PDF-RAG (Retrieval-Augmented Generation) chatbot built with:

- **Frontend**: Next.js (React) with TypeScript
- **Backend**: Node.js/Express with LangChain
- **Vector Database**: Pinecone
- **AI**: OpenAI (embeddings + ChatGPT)

## Architecture

```
User uploads PDF → Backend extracts text → LangChain RecursiveCharacterTextSplitter
→ OpenAI embeddings → Store in Pinecone (namespace: pdf_<timestamp>)

User asks question → Backend embeds question → Similarity search in Pinecone
→ Retrieve context → ChatGPT generates answer (RAG)
```

## Folder Structure

```
chatbot/
├── backend/
│   ├── config/
│   │   └── env.js                    # Environment config
│   ├── routes/
│   │   ├── langchain-upload.js      # POST /api/langchain/upload
│   │   └── langchain-query.js       # POST /api/langchain/query
│   ├── services/
│   │   └── langchain.js             # LangChain PDF processing & RAG
│   ├── server.js                     # Express server
│   ├── package.json
│   └── .env.local                    # Your API keys
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── langchain-upload/
│   │   │   │   └── page.tsx         # Upload page
│   │   │   └── langchain-chat/
│   │   │       └── page.tsx         # Chat page
│   │   ├── components/
│   │   │   ├── LangChainUploader.tsx
│   │   │   └── LangChainChat.tsx
│   │   ├── hooks/
│   │   │   └── useLangChainChat.ts
│   │   └── lib/
│   │       └── langchainApi.ts      # API client
│   ├── package.json
│   └── .env.local                    # API URL
│
└── package.json                      # Root scripts
```

## Dependencies

### Backend
```json
{
  "express": "Express server",
  "cors": "CORS middleware",
  "multer": "File upload handling",
  "dotenv": "Environment variables",
  "langchain": "LangChain framework",
  "@langchain/openai": "OpenAI integration",
  "@langchain/pinecone": "Pinecone integration",
  "@pinecone-database/pinecone": "Pinecone client (v5.x)",
  "pdf-parse": "PDF text extraction"
}
```

### Frontend
```json
{
  "next": "Next.js framework",
  "react": "React library",
  "axios": "HTTP client"
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Root
npm install

# This will automatically install both backend and frontend
```

### 2. Configure Environment Variables

**Backend** (`backend/.env.local`):
```env
# Required
OPENAI_API_KEY=sk-proj-xxxxx          # Get from https://platform.openai.com/api-keys
PINECONE_API_KEY=pcsk-xxxxx          # Get from https://www.pinecone.io/
PINECONE_INDEX_NAME=pdf-chatbot      # Your Pinecone index name

# Optional
PORT=5001
FRONTEND_URL=http://localhost:3001
OPENAI_EMBED_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini
CHUNK_SIZE=1500
CHUNK_OVERLAP=200
RETRIEVAL_TOP_K=5
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### 3. Create Pinecone Index

1. Go to https://www.pinecone.io/ and sign up/login
2. Create a new index:
   - **Name**: `pdf-chatbot` (or match your PINECONE_INDEX_NAME)
   - **Dimensions**: `1536` (for text-embedding-3-small)
   - **Metric**: `cosine`
   - **Cloud**: `AWS` or `GCP`
   - **Region**: `us-east-1` (or your preference)

### 4. Start Servers

**Option A: Start both servers in parallel**
```bash
npm run dev
```

**Option B: Start separately**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### 5. Access the Application

- **LangChain Upload**: http://localhost:3001/langchain-upload
- **LangChain Chat**: http://localhost:3001/langchain-chat

## API Endpoints

### POST /api/langchain/upload

Upload PDF and create embeddings using LangChain.

**Request**:
```bash
curl -X POST http://localhost:5001/api/langchain/upload \
  -F "file=@document.pdf"
```

**Response**:
```json
{
  "message": "PDF processed successfully",
  "namespace": "pdf_1699564123456",
  "fileName": "document.pdf",
  "chunksIndexed": 127
}
```

**Process**:
1. Extract text from PDF using `pdf-parse`
2. Split text using `RecursiveCharacterTextSplitter` (1500 chars, 200 overlap)
3. Create embeddings using OpenAI `text-embedding-3-small`
4. Store vectors in Pinecone with namespace `pdf_<timestamp>`

### POST /api/langchain/query

Query using RAG (Retrieval-Augmented Generation).

**Request**:
```bash
curl -X POST http://localhost:5001/api/langchain/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is this document about?",
    "namespace": "pdf_1699564123456"
  }'
```

**Response**:
```json
{
  "question": "What is this document about?",
  "reply": "Based on the document, this is about...",
  "references": [
    {
      "rank": 1,
      "score": 0.89,
      "textPreview": "The document discusses...",
      "source": "document.pdf"
    }
  ],
  "namespace": "pdf_1699564123456"
}
```

**Process**:
1. Embed question using OpenAI
2. Perform similarity search in Pinecone (top 5 results)
3. Build context from retrieved chunks
4. Generate answer using ChatGPT with RAG prompt
5. Return answer with references

## How It Works

### 1. PDF Upload Flow

```
User selects PDF
  ↓
Frontend sends file to /api/langchain/upload
  ↓
Backend extracts text (pdf-parse)
  ↓
LangChain RecursiveCharacterTextSplitter splits text into chunks
  ↓
OpenAI creates embeddings for each chunk
  ↓
Vectors stored in Pinecone with namespace pdf_<timestamp>
  ↓
Returns namespace to frontend
```

### 2. Chat Query Flow

```
User types question
  ↓
Frontend sends question + namespace to /api/langchain/query
  ↓
Backend embeds question (OpenAI)
  ↓
Similarity search in Pinecone (retrieve top 5 chunks)
  ↓
Build context from retrieved chunks
  ↓
Send to ChatGPT with RAG prompt template
  ↓
ChatGPT generates answer based on context
  ↓
Return answer + references to frontend
```

### 3. LangChain Components Used

- **RecursiveCharacterTextSplitter**: Intelligently splits text into chunks
- **OpenAIEmbeddings**: Creates vector embeddings
- **PineconeStore**: Manages vector storage and retrieval
- **ChatOpenAI**: ChatGPT integration
- **PromptTemplate**: Structured RAG prompts

## Key Features

### Backend (LangChain)

✅ **Smart Text Chunking**: Uses RecursiveCharacterTextSplitter for optimal chunk boundaries
✅ **Vector Embeddings**: OpenAI text-embedding-3-small (1536 dimensions)
✅ **Vector Storage**: Pinecone with namespaced documents
✅ **RAG Pipeline**: Similarity search + context injection + ChatGPT
✅ **Error Handling**: Comprehensive error messages
✅ **CORS**: Configured for localhost:3001

### Frontend (Next.js + TypeScript)

✅ **PDF Upload**: Drag-and-drop interface
✅ **Chat UI**: ChatGPT-style message bubbles
✅ **Loading States**: Visual feedback during processing
✅ **References**: Shows source snippets with relevance scores
✅ **Responsive**: Works on all screen sizes
✅ **Type Safety**: Full TypeScript support

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | - | OpenAI API key |
| `PINECONE_API_KEY` | ✅ Yes | - | Pinecone API key |
| `PINECONE_INDEX_NAME` | ✅ Yes | - | Pinecone index name |
| `PORT` | No | 5001 | Backend server port |
| `FRONTEND_URL` | No | http://localhost:3001 | Frontend URL for CORS |
| `OPENAI_EMBED_MODEL` | No | text-embedding-3-small | OpenAI embedding model |
| `OPENAI_CHAT_MODEL` | No | gpt-4o-mini | OpenAI chat model |
| `CHUNK_SIZE` | No | 1500 | Text chunk size |
| `CHUNK_OVERLAP` | No | 200 | Overlap between chunks |
| `RETRIEVAL_TOP_K` | No | 5 | Number of chunks to retrieve |

## Troubleshooting

### Backend won't start
- Check `OPENAI_API_KEY` and `PINECONE_API_KEY` in `backend/.env.local`
- Ensure port 5001 is not in use: `lsof -i :5001`

### Pinecone errors
- Verify index name matches `PINECONE_INDEX_NAME`
- Check index dimensions are 1536
- Ensure index is created and ready

### Upload fails
- PDF must contain extractable text (not just images)
- Maximum file size is 25MB
- Check backend logs for detailed errors

### Query returns no results
- Verify namespace exists (check upload response)
- Try different questions
- Check Pinecone index stats

### CORS errors
- Ensure `FRONTEND_URL` in backend .env matches your frontend URL
- Check browser console for specific CORS error

## Testing

### Test Backend Health
```bash
curl http://localhost:5001/health
```
Expected: `{"status":"ok"}`

### Test Upload
```bash
curl -X POST http://localhost:5001/api/langchain/upload \
  -F "file=@sample.pdf"
```

### Test Query
```bash
curl -X POST http://localhost:5001/api/langchain/query \
  -H "Content-Type: application/json" \
  -d '{"question":"test","namespace":"pdf_1699564123456"}'
```

## Code Examples

### Backend: Processing PDF with LangChain

```javascript
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';

// Split text into chunks
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1500,
  chunkOverlap: 200,
});

const docs = await textSplitter.createDocuments([text]);

// Create embeddings and store in Pinecone
const namespace = `pdf_${Date.now()}`;
await PineconeStore.fromDocuments(docs, embeddings, {
  pineconeIndex,
  namespace,
});
```

### Backend: RAG Query

```javascript
// Similarity search
const results = await vectorStore.similaritySearchWithScore(question, 5);

// Build context
const context = results.map(([doc, score]) => doc.pageContent).join('\n\n');

// Generate answer with ChatGPT
const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`;
const response = await chatModel.invoke(prompt);
```

### Frontend: Upload PDF

```typescript
const result = await uploadPdfWithLangChain(file);
// result.namespace: "pdf_1699564123456"
// result.chunksIndexed: 127
```

### Frontend: Query Chat

```typescript
const response = await queryWithLangChain(question, namespace);
// response.reply: "Based on the document..."
// response.references: [...chunks with scores...]
```

## Production Deployment

### Backend
- Deploy to Railway, Render, or AWS
- Set environment variables in platform dashboard
- Ensure Pinecone index is accessible
- Configure CORS for production frontend URL

### Frontend
- Deploy to Vercel or Netlify
- Set `NEXT_PUBLIC_API_URL` to production backend URL
- Build-time environment variable required

### Security
- Never commit `.env.local` files
- Use secrets management for API keys
- Add rate limiting
- Implement authentication
- Validate all inputs

## Performance Tips

- **Chunk Size**: Larger chunks (2000) for long-form content, smaller (1000) for Q&A
- **Overlap**: 200-300 chars ensures context continuity
- **Top K**: Increase to 10 for complex questions, keep at 5 for simple ones
- **Model**: Use gpt-4 for better answers, gpt-4o-mini for cost savings

## Costs

Approximate costs per PDF:
- **OpenAI Embeddings**: $0.0001 per 1K tokens (~$0.01 per PDF)
- **OpenAI Chat**: $0.0005 per 1K tokens (~$0.005 per query)
- **Pinecone**: Free tier includes 100K vectors, ~$0.096/month for 100K vectors after

## Next Steps

1. Add user authentication
2. Store chat history in database
3. Support multiple file formats (DOCX, TXT)
4. Add streaming responses
5. Implement document management UI
6. Add export chat history feature

## Resources

- [LangChain Docs](https://js.langchain.com/docs/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Pinecone Docs](https://docs.pinecone.io/)
- [Next.js Docs](https://nextjs.org/docs)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs
3. Test endpoints with curl
4. Verify environment variables
