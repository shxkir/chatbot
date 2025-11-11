# Complete LangChain PDF-RAG Chatbot

## ✅ What's Been Built

A production-ready PDF chatbot with:

- **Frontend**: Next.js with TypeScript (localhost:3001)
- **Backend**: Express + LangChain (localhost:5001)
- **Vector DB**: Pinecone with namespaced documents
- **AI**: OpenAI embeddings + ChatGPT RAG

## 🎯 Features Implemented

### Backend Features
✅ **POST /api/langchain/upload** - PDF upload + embedding
  - PDF text extraction (pdf-parse)
  - Smart chunking with RecursiveCharacterTextSplitter
  - OpenAI embeddings (text-embedding-3-small)
  - Pinecone storage with namespace `pdf_<timestamp>`

✅ **POST /api/langchain/query** - RAG-powered chat
  - Similarity search in Pinecone
  - Context retrieval (top 5 chunks)
  - ChatGPT response with references
  - Relevance scores included

✅ **CORS configured** for localhost:3001
✅ **Error handling** with descriptive messages
✅ **Environment variables** for all configuration

### Frontend Features
✅ **Upload Page** (/langchain-upload)
  - Drag-and-drop PDF interface
  - Progress indicators
  - File size display
  - Success/error states

✅ **Chat Page** (/langchain-chat)
  - ChatGPT-style UI
  - Message history
  - Loading animations
  - Reference display with scores

✅ **API Client** with TypeScript types
✅ **Custom hooks** for state management
✅ **Responsive design**

## 📁 Project Structure

```
chatbot/
├── backend/
│   ├── config/
│   │   └── env.js                          # Environment configuration
│   ├── routes/
│   │   ├── langchain-upload.js            # LangChain upload endpoint
│   │   └── langchain-query.js             # LangChain query endpoint
│   ├── services/
│   │   ├── langchain.js                   # LangChain PDF processing & RAG ⭐
│   │   ├── embeddings.js                  # Original OpenAI service
│   │   ├── pinecone.js                    # Original Pinecone service
│   │   └── pdf.js                         # Original PDF service
│   ├── server.js                          # Express server with both routes
│   ├── package.json
│   └── .env.local                         # Your API keys
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── langchain-upload/
│   │   │   │   └── page.tsx              # LangChain upload page ⭐
│   │   │   └── langchain-chat/
│   │   │       └── page.tsx              # LangChain chat page ⭐
│   │   ├── components/
│   │   │   ├── LangChainUploader.tsx     # Upload component ⭐
│   │   │   └── LangChainChat.tsx         # Chat component ⭐
│   │   ├── hooks/
│   │   │   └── useLangChainChat.ts       # Chat hook ⭐
│   │   └── lib/
│   │       ├── langchainApi.ts           # LangChain API client ⭐
│   │       └── backendApi.ts             # Original API client
│   ├── package.json
│   └── .env.local
│
├── LANGCHAIN_GUIDE.md                     # Comprehensive guide ⭐
├── LANGCHAIN_README.md                    # This file ⭐
├── QUICK_START.md                         # Quick setup guide
└── package.json                           # Root package with scripts

⭐ = New LangChain files
```

## 🚀 Quick Start (3 Steps)

### Step 1: Add API Keys

Edit `backend/.env.local`:
```bash
OPENAI_API_KEY=sk-proj-xxxxx        # Your actual OpenAI key
PINECONE_API_KEY=pcsk-xxxxx         # Your actual Pinecone key
PINECONE_INDEX_NAME=pdf-chatbot     # Your index name
```

### Step 2: Create Pinecone Index

Go to https://www.pinecone.io/ and create an index:
- **Name**: `pdf-chatbot`
- **Dimensions**: `1536`
- **Metric**: `cosine`

### Step 3: Start Servers

```bash
# Install dependencies (first time only)
npm install

# Start both servers
npm run dev
```

### Step 4: Use the App

- **Upload PDF**: http://localhost:3001/langchain-upload
- **Chat**: http://localhost:3001/langchain-chat

## 📡 API Endpoints

### Backend Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/langchain/upload` | POST | Upload PDF with LangChain |
| `/api/langchain/query` | POST | Query with RAG |
| `/api/upload` | POST | Original upload (no LangChain) |
| `/api/query` | POST | Original query (no LangChain) |

### LangChain Upload Example

```bash
curl -X POST http://localhost:5001/api/langchain/upload \
  -F "file=@document.pdf"
```

Response:
```json
{
  "message": "PDF processed successfully",
  "namespace": "pdf_1699564123456",
  "fileName": "document.pdf",
  "chunksIndexed": 127
}
```

### LangChain Query Example

```bash
curl -X POST http://localhost:5001/api/langchain/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is this document about?",
    "namespace": "pdf_1699564123456"
  }'
```

Response:
```json
{
  "question": "What is this document about?",
  "reply": "Based on the provided context...",
  "references": [
    {
      "rank": 1,
      "score": 0.89,
      "textPreview": "This document discusses...",
      "source": "document.pdf"
    }
  ],
  "namespace": "pdf_1699564123456"
}
```

## 🔧 Dependencies Installed

### Backend (New)
```json
{
  "langchain": "^0.3.11",
  "@langchain/openai": "^0.3.23",
  "@langchain/pinecone": "^1.0.0",
  "@pinecone-database/pinecone": "^5.0.2"
}
```

All other dependencies remain the same.

## 🎨 Frontend Pages

### Upload Page: /langchain-upload
- Modern gradient background
- Drag-and-drop PDF upload
- Real-time status updates
- Shows chunks indexed
- Auto-redirect to chat

### Chat Page: /langchain-chat
- ChatGPT-style interface
- Message bubbles
- Typing indicators
- Reference panel with scores
- Namespace display

## 💡 How It Works

### Upload Flow
```
1. User uploads PDF → Frontend sends to /api/langchain/upload
2. Backend extracts text with pdf-parse
3. LangChain RecursiveCharacterTextSplitter splits into chunks
4. OpenAI creates embeddings for each chunk
5. Store in Pinecone with namespace pdf_<timestamp>
6. Return namespace to frontend
```

### Query Flow
```
1. User asks question → Frontend sends to /api/langchain/query
2. Backend embeds question with OpenAI
3. Pinecone similarity search (top 5 chunks)
4. Build context from retrieved chunks
5. ChatGPT generates answer with context
6. Return answer + references with scores
```

## 🔑 Required Environment Variables

### Backend (.env.local)
```env
OPENAI_API_KEY=sk-proj-xxxxx          # Required
PINECONE_API_KEY=pcsk-xxxxx          # Required
PINECONE_INDEX_NAME=pdf-chatbot      # Required
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001  # Pre-configured
```

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:5001/health
# Expected: {"status":"ok"}
```

### Test LangChain Upload
```bash
curl -X POST http://localhost:5001/api/langchain/upload \
  -F "file=@sample.pdf"
```

### Test LangChain Query
```bash
curl -X POST http://localhost:5001/api/langchain/query \
  -H "Content-Type: application/json" \
  -d '{"question":"test","namespace":"pdf_1699564123456"}'
```

## 📚 Key LangChain Features

### RecursiveCharacterTextSplitter
- Intelligently splits text at natural boundaries
- Preserves context with overlap
- Configurable chunk size (1500 chars by default)

### PineconeStore
- LangChain integration for Pinecone
- Automatic embedding and storage
- Similarity search with scores

### OpenAI Integration
- Embeddings: text-embedding-3-small (1536 dimensions)
- Chat: gpt-4o-mini (fast and cost-effective)
- Temperature: 0.2 (focused answers)

### RAG Pipeline
1. Embed user question
2. Retrieve similar chunks
3. Build context prompt
4. Generate answer with ChatGPT
5. Return with source references

## 🆚 Two Implementations Available

You now have **TWO working implementations**:

### Original (Without LangChain)
- Routes: `/api/upload`, `/api/query`
- Custom chunking function
- Direct OpenAI + Pinecone integration
- Pages: `/upload`, `/chat`

### LangChain (New) ⭐
- Routes: `/api/langchain/upload`, `/api/langchain/query`
- RecursiveCharacterTextSplitter
- LangChain abstractions
- Pages: `/langchain-upload`, `/langchain-chat`

Both work independently! Use whichever you prefer.

## 🐛 Troubleshooting

**"Network error contacting /api"**
- Ensure backend is running: `npm run dev:backend`
- Check port 5001 is free: `lsof -i :5001`

**"OPENAI_API_KEY is not set"**
- Add your key to `backend/.env.local`
- Restart the backend server

**"Namespace not found"**
- Upload a PDF first
- Check the namespace value from upload response

**CORS errors**
- Verify `FRONTEND_URL` in backend .env
- Should be `http://localhost:3001`

## 📖 Documentation

- **LANGCHAIN_GUIDE.md** - Complete guide with examples
- **QUICK_START.md** - Quick setup reference
- **SETUP_GUIDE.md** - Original Express setup
- **CHANGES_SUMMARY.md** - What was changed

## 🎯 Next Steps

1. **Add API keys** to `backend/.env.local`
2. **Create Pinecone index** (1536 dimensions, cosine metric)
3. **Start servers**: `npm run dev`
4. **Upload PDF**: http://localhost:3001/langchain-upload
5. **Start chatting**: Ask questions about your PDF!

## 💰 Cost Estimates

Per 100-page PDF:
- **Embeddings**: ~$0.01
- **Chat queries**: ~$0.005 per question
- **Pinecone**: Free tier includes 100K vectors

## 🚀 Production Ready

The app includes:
- ✅ Error handling
- ✅ Input validation
- ✅ CORS configuration
- ✅ Environment variables
- ✅ TypeScript types
- ✅ Loading states
- ✅ Responsive design

For production deployment, see LANGCHAIN_GUIDE.md.

## 🎉 You're Ready!

Your complete LangChain PDF-RAG chatbot is ready to use!

1. Add your API keys to `backend/.env.local`
2. Run `npm run dev`
3. Go to http://localhost:3001/langchain-upload
4. Upload a PDF and start chatting!

Need help? Check LANGCHAIN_GUIDE.md for detailed documentation.
