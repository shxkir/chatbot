# 🚀 START HERE - Your Complete PDF-RAG Chatbot

## ✨ What You Have

A **complete, production-ready** PDF-RAG chatbot with:

- ✅ **Frontend**: Next.js + TypeScript (localhost:3001)
- ✅ **Backend**: Express + LangChain (localhost:5001)
- ✅ **Two implementations**: Original + LangChain
- ✅ **All features working**: Upload, chunk, embed, store, query, chat

## 🎯 Quick Start (Under 5 Minutes)

### 1. Get API Keys

**OpenAI** (https://platform.openai.com/api-keys):
```
Copy your API key: sk-proj-xxxxxxxxxxxxx
```

**Pinecone** (https://www.pinecone.io/):
```
1. Sign up/login
2. Create index: name="pdf-chatbot", dimensions=1536, metric=cosine
3. Copy API key: pcsk-xxxxxxxxxxxxx
```

### 2. Add Keys

Edit `backend/.env.local`:
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
PINECONE_API_KEY=pcsk-xxxxxxxxxxxxx
PINECONE_INDEX_NAME=pdf-chatbot
```

### 3. Start Everything

```bash
npm install  # First time only
npm run dev  # Starts both servers
```

### 4. Open Browser

**LangChain Version (Recommended)**:
- Upload: http://localhost:3001/langchain-upload
- Chat: http://localhost:3001/langchain-chat

**Original Version**:
- Upload: http://localhost:3001/upload
- Chat: http://localhost:3001/chat

## 🎨 What Each Implementation Does

### LangChain Version (Recommended) ⭐

**Routes**:
- `POST /api/langchain/upload` - Upload with RecursiveCharacterTextSplitter
- `POST /api/langchain/query` - Query with RAG pipeline

**Features**:
- ✅ Smart text chunking
- ✅ Automatic metadata handling
- ✅ Production-ready abstractions
- ✅ Prompt templates
- ✅ Better error handling

**Use this for**: Production, new projects, best practices

### Original Version

**Routes**:
- `POST /api/upload` - Upload with simple chunking
- `POST /api/query` - Query with basic RAG

**Features**:
- ✅ Simple implementation
- ✅ Direct OpenAI/Pinecone calls
- ✅ Minimal dependencies
- ✅ Easy to understand

**Use this for**: Learning, customization, understanding RAG internals

## 📚 Documentation

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **START_HERE.md** | This file - quick start | First! |
| **LANGCHAIN_README.md** | LangChain overview | After setup |
| **LANGCHAIN_GUIDE.md** | Comprehensive guide | For details |
| **IMPLEMENTATION_COMPARISON.md** | Compare both versions | Choosing which to use |
| **QUICK_START.md** | Original setup | Original version |
| **SETUP_GUIDE.md** | Detailed setup | Troubleshooting |

## 🔧 Commands

```bash
# Install all dependencies
npm install

# Start both servers in parallel (recommended)
npm run dev

# Or start separately:
npm run dev:backend   # Backend on port 5001
npm run dev:frontend  # Frontend on port 3001

# Health check
curl http://localhost:5001/health
```

## 🧪 Test It Works

### 1. Test Backend
```bash
curl http://localhost:5001/health
```
Expected: `{"status":"ok"}`

### 2. Test Upload
```bash
curl -X POST http://localhost:5001/api/langchain/upload \
  -F "file=@sample.pdf"
```

### 3. Test Query
```bash
curl -X POST http://localhost:5001/api/langchain/query \
  -H "Content-Type: application/json" \
  -d '{"question":"test","namespace":"pdf_1699564123456"}'
```

## 📁 Key Files

### Backend (LangChain) ⭐
```
backend/
├── services/langchain.js           # Main LangChain implementation
├── routes/langchain-upload.js      # Upload endpoint
├── routes/langchain-query.js       # Query endpoint
└── server.js                        # Express server
```

### Frontend (LangChain) ⭐
```
frontend/src/
├── app/
│   ├── langchain-upload/page.tsx   # Upload page
│   └── langchain-chat/page.tsx     # Chat page
├── components/
│   ├── LangChainUploader.tsx       # Upload UI
│   └── LangChainChat.tsx           # Chat UI
├── hooks/
│   └── useLangChainChat.ts         # Chat logic
└── lib/
    └── langchainApi.ts             # API client
```

## 🌟 Features

### Upload Flow
1. User selects PDF
2. Frontend sends to backend
3. Backend extracts text
4. LangChain splits into smart chunks
5. OpenAI creates embeddings
6. Store in Pinecone with namespace `pdf_<timestamp>`
7. Return namespace to frontend

### Chat Flow
1. User asks question
2. Backend embeds question
3. Similarity search in Pinecone (top 5 chunks)
4. Build context from results
5. ChatGPT generates answer
6. Return answer + references with scores

## 🐛 Common Issues

### "Network error contacting /api"
```bash
# Check backend is running
npm run dev:backend

# Check port 5001
lsof -i :5001
```

### "OPENAI_API_KEY is not set"
```bash
# Edit backend/.env.local
# Add: OPENAI_API_KEY=sk-proj-xxxxx
# Restart backend
```

### "Namespace not found"
```bash
# Upload a PDF first at /langchain-upload
# Use the returned namespace in chat
```

### CORS errors
```bash
# Check backend/.env.local
# Ensure: FRONTEND_URL=http://localhost:3001
```

## 💡 Pro Tips

1. **Use LangChain version** for production (better chunking)
2. **Keep both versions** - they don't interfere
3. **Check LANGCHAIN_GUIDE.md** for advanced features
4. **Test with curl** if frontend has issues
5. **Check backend logs** for detailed errors

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/langchain/upload` | POST | LangChain upload ⭐ |
| `/api/langchain/query` | POST | LangChain query ⭐ |
| `/api/upload` | POST | Original upload |
| `/api/query` | POST | Original query |

⭐ = Recommended

## 🎓 Learning Path

1. **Quick Start**: Follow steps above (5 min)
2. **Use It**: Upload a PDF and chat (10 min)
3. **Original Version**: Try the original implementation (10 min)
4. **Compare**: See IMPLEMENTATION_COMPARISON.md (5 min)
5. **Deep Dive**: Read LANGCHAIN_GUIDE.md (20 min)
6. **Customize**: Modify code to fit your needs

## 🚀 Next Steps

### After Setup Works:

1. **Try different PDFs** - test with various document types
2. **Experiment with questions** - see how RAG responds
3. **Check references** - understand what chunks are retrieved
4. **Read the code** - learn how LangChain works
5. **Customize UI** - make it your own
6. **Add features** - authentication, history, etc.

### Production Deployment:

See **LANGCHAIN_GUIDE.md** section on production deployment.

## 💰 Costs

Per 100-page PDF:
- **Embeddings**: ~$0.01 (one-time)
- **Queries**: ~$0.005 per question
- **Pinecone**: Free tier covers 100K vectors

Total: **~$0.50 per month** for moderate use

## ✅ Checklist

Before you start:
- [ ] Got OpenAI API key
- [ ] Got Pinecone API key
- [ ] Created Pinecone index (name: pdf-chatbot, dim: 1536)
- [ ] Added keys to `backend/.env.local`
- [ ] Ran `npm install`

Ready to run:
- [ ] Run `npm run dev`
- [ ] Backend shows "Backend listening on http://localhost:5001"
- [ ] Frontend shows "ready started server on 0.0.0.0:3001"
- [ ] Health check works: `curl http://localhost:5001/health`

Ready to use:
- [ ] Go to http://localhost:3001/langchain-upload
- [ ] Upload a PDF
- [ ] Get redirected to chat page
- [ ] Ask a question
- [ ] Get an answer with references

## 🎉 You're All Set!

Your complete PDF-RAG chatbot is ready to go!

**Next**:
1. Add your API keys to `backend/.env.local`
2. Run `npm run dev`
3. Go to http://localhost:3001/langchain-upload
4. Upload a PDF and start chatting!

**Questions?** Check the other documentation files or the code comments.

**Happy chatting! 🚀**
