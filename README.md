# PDF RAG Chatbot - Complete Implementation

A production-ready PDF chatbot with **Retrieval-Augmented Generation (RAG)** using LangChain, OpenAI, and Pinecone.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Pinecone account ([Sign up here](https://www.pinecone.io/))

### Setup in 3 Steps

**1. Install Dependencies**
```bash
npm install
```

**2. Configure Environment**

Edit `backend/.env.local`:
```env
OPENAI_API_KEY=sk-proj-your-key-here
PINECONE_API_KEY=pcsk-your-key-here
PINECONE_INDEX_NAME=pdf-chatbot
```

Create a Pinecone index:
- Name: `pdf-chatbot`
- Dimensions: `1536`
- Metric: `cosine`

**3. Start Servers**
```bash
npm run dev
```

**4. Open Browser**
- LangChain version: http://localhost:3001/langchain-upload
- Original version: http://localhost:3001/upload

## 🎯 Two Implementations

This project includes **two working implementations**:

### LangChain Implementation ⭐ (Recommended)

**Routes**:
- `POST /api/langchain/upload` - Upload & process PDF
- `POST /api/langchain/query` - Query with RAG

**Features**:
- ✅ RecursiveCharacterTextSplitter for smart chunking
- ✅ Automatic embedding and storage
- ✅ Production-ready abstractions
- ✅ Prompt templates
- ✅ Better context preservation

**Pages**:
- `/langchain-upload` - Upload interface
- `/langchain-chat` - Chat interface

### Original Implementation

**Routes**:
- `POST /api/upload` - Basic upload
- `POST /api/query` - Basic query

**Features**:
- ✅ Simple, direct implementation
- ✅ Minimal dependencies
- ✅ Easy to understand
- ✅ Great for learning

**Pages**:
- `/upload` - Upload interface
- `/chat` - Chat interface

Both implementations work simultaneously and independently!

## 📁 Project Structure

```
chatbot/
├── backend/                          # Express + LangChain backend
│   ├── services/
│   │   ├── langchain.js             # LangChain RAG implementation ⭐
│   │   ├── embeddings.js            # Original OpenAI service
│   │   ├── pinecone.js              # Original Pinecone service
│   │   └── pdf.js                   # PDF utilities
│   ├── routes/
│   │   ├── langchain-upload.js      # LangChain upload endpoint ⭐
│   │   ├── langchain-query.js       # LangChain query endpoint ⭐
│   │   ├── upload.js                # Original upload
│   │   └── chat.js                  # Original query
│   ├── server.js                     # Express server
│   └── .env.local                    # Your API keys
│
├── frontend/                         # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── langchain-upload/    # LangChain upload page ⭐
│   │   │   ├── langchain-chat/      # LangChain chat page ⭐
│   │   │   └── (protected)/         # Original pages
│   │   ├── components/
│   │   │   ├── LangChainUploader.tsx ⭐
│   │   │   ├── LangChainChat.tsx    ⭐
│   │   │   ├── FileUploader.tsx
│   │   │   └── ChatUI.tsx
│   │   ├── hooks/
│   │   │   ├── useLangChainChat.ts  ⭐
│   │   │   └── useChat.ts
│   │   └── lib/
│   │       ├── langchainApi.ts      ⭐
│   │       └── backendApi.ts
│   └── .env.local
│
└── Documentation/
    ├── START_HERE.md                 # 👈 Start with this!
    ├── LANGCHAIN_README.md           # LangChain overview
    ├── LANGCHAIN_GUIDE.md            # Comprehensive guide
    ├── ARCHITECTURE.md               # System architecture
    ├── IMPLEMENTATION_COMPARISON.md  # Compare both versions
    └── QUICK_START.md                # Quick reference

⭐ = New LangChain files
```

## 🔧 How It Works

### Upload Flow (LangChain)
```
1. User uploads PDF
   ↓
2. Extract text with pdf-parse
   ↓
3. Split with RecursiveCharacterTextSplitter (1500 chars, 200 overlap)
   ↓
4. Create embeddings with OpenAI (text-embedding-3-small, 1536 dims)
   ↓
5. Store in Pinecone with namespace pdf_<timestamp>
   ↓
6. Return namespace to frontend
```

### Query Flow (LangChain RAG)
```
1. User asks question
   ↓
2. Embed question with OpenAI
   ↓
3. Similarity search in Pinecone (top 5 chunks)
   ↓
4. Build context from retrieved chunks
   ↓
5. Generate answer with ChatGPT (gpt-4o-mini)
   ↓
6. Return answer + references with scores
```

## 🎨 Features

### Backend
- ✅ PDF upload and text extraction
- ✅ Smart text chunking with LangChain
- ✅ OpenAI embeddings (text-embedding-3-small)
- ✅ Pinecone vector storage with namespaces
- ✅ Similarity search with scores
- ✅ RAG pipeline with ChatGPT
- ✅ CORS enabled for localhost:3001
- ✅ Error handling and validation
- ✅ Environment variable configuration

### Frontend
- ✅ Modern Next.js with TypeScript
- ✅ Drag-and-drop PDF upload
- ✅ ChatGPT-style interface
- ✅ Real-time status updates
- ✅ Reference display with relevance scores
- ✅ Loading states and animations
- ✅ Responsive design
- ✅ Error handling

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
  -d '{
    "question": "What is this document about?",
    "namespace": "pdf_1699564123456"
  }'
```

## 📚 Technology Stack

### Backend
- **Express** - Web server
- **LangChain** - RAG framework
  - RecursiveCharacterTextSplitter
  - PineconeStore integration
  - PromptTemplate
- **OpenAI** - Embeddings + ChatGPT
- **Pinecone** - Vector database
- **pdf-parse** - PDF text extraction
- **Multer** - File uploads

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **CSS-in-JS** - Styled components

## 🔑 Environment Variables

### Backend (`backend/.env.local`)
```env
# Required
OPENAI_API_KEY=sk-proj-xxxxx
PINECONE_API_KEY=pcsk-xxxxx
PINECONE_INDEX_NAME=pdf-chatbot

# Optional (with defaults)
PORT=5001
FRONTEND_URL=http://localhost:3001
OPENAI_EMBED_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini
CHUNK_SIZE=1500
CHUNK_OVERLAP=200
RETRIEVAL_TOP_K=5
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| **START_HERE.md** | Quick start guide (read this first!) |
| **LANGCHAIN_README.md** | LangChain implementation overview |
| **LANGCHAIN_GUIDE.md** | Comprehensive guide with examples |
| **ARCHITECTURE.md** | System architecture diagrams |
| **IMPLEMENTATION_COMPARISON.md** | Compare LangChain vs Original |
| **QUICK_START.md** | Quick reference card |
| **SETUP_GUIDE.md** | Detailed setup instructions |

## 💡 Commands

```bash
# Install all dependencies
npm install

# Start both servers (recommended)
npm run dev

# Start servers separately
npm run dev:backend   # Backend on port 5001
npm run dev:frontend  # Frontend on port 3001

# Install backend only
npm run install:backend

# Install frontend only
npm run install:frontend
```

## 🐛 Troubleshooting

### "Network error contacting /api"
- Check backend is running: `npm run dev:backend`
- Verify port 5001 is free: `lsof -i :5001`
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

### "OPENAI_API_KEY is not set"
- Add your API key to `backend/.env.local`
- Restart the backend server

### "Namespace not found"
- Upload a PDF first at `/langchain-upload`
- Use the returned namespace in queries

### CORS errors
- Check `FRONTEND_URL` in `backend/.env.local`
- Should be `http://localhost:3001`

## 💰 Cost Estimates

Per 100-page PDF:
- **Embeddings**: ~$0.01 (one-time per document)
- **Queries**: ~$0.005 per question
- **Pinecone**: Free tier includes 100K vectors

Total: **~$0.50/month** for moderate usage

## 🚀 Production Deployment

### Backend (Railway, Render, or AWS)
1. Deploy backend to hosting platform
2. Set environment variables in platform dashboard
3. Update `FRONTEND_URL` to production frontend URL

### Frontend (Vercel or Netlify)
1. Deploy frontend to hosting platform
2. Set `NEXT_PUBLIC_API_URL` to production backend URL
3. Ensure it's a build-time environment variable

See **LANGCHAIN_GUIDE.md** for detailed deployment instructions.

## 🎓 Learning Path

1. **Quick Start**: Follow setup steps above (5 min)
2. **Try It**: Upload a PDF and chat (10 min)
3. **Explore**: Try both implementations (10 min)
4. **Compare**: Read IMPLEMENTATION_COMPARISON.md (5 min)
5. **Deep Dive**: Read LANGCHAIN_GUIDE.md (20 min)
6. **Customize**: Modify to fit your needs

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/langchain/upload` | POST | LangChain upload ⭐ |
| `/api/langchain/query` | POST | LangChain query ⭐ |
| `/api/upload` | POST | Original upload |
| `/api/query` | POST | Original query |

⭐ = Recommended for new projects

## ✨ Key Differences

| Feature | Original | LangChain |
|---------|----------|-----------|
| **Text Splitting** | Simple chunking | RecursiveCharacterTextSplitter |
| **Code Complexity** | More verbose | More concise |
| **Abstraction** | Low-level | High-level |
| **Best For** | Learning | Production |
| **Namespace Format** | UUID | `pdf_<timestamp>` |

## 🎯 Why LangChain?

- ✅ **Better Chunking**: RecursiveCharacterTextSplitter preserves context
- ✅ **Production Ready**: Battle-tested abstractions
- ✅ **Easier to Extend**: Add agents, chains, memory
- ✅ **Best Practices**: Industry-standard approach
- ✅ **Cleaner Code**: Less boilerplate

## 🤝 Contributing

This is a complete, working implementation. Feel free to:
- Customize the UI
- Add new features (authentication, history, etc.)
- Deploy to production
- Use as a template for your projects

## 📝 License

This project is provided as-is for educational and commercial use.

## 🙏 Acknowledgments

Built with:
- [LangChain](https://js.langchain.com/) - RAG framework
- [OpenAI](https://openai.com/) - Embeddings and chat
- [Pinecone](https://www.pinecone.io/) - Vector database
- [Next.js](https://nextjs.org/) - React framework
- [Express](https://expressjs.com/) - Web server

---

## 🎉 Ready to Go!

Your complete PDF-RAG chatbot is ready. Just:

1. **Add API keys** to `backend/.env.local`
2. **Create Pinecone index** (1536 dimensions, cosine metric)
3. **Run** `npm run dev`
4. **Open** http://localhost:3001/langchain-upload
5. **Upload** a PDF and start chatting!

**Need help?** Check **START_HERE.md** for detailed instructions.

**Happy chatting! 🚀**
