# Quick Start Guide

## What Was Fixed

### The Problem
Your frontend was configured to call Firebase Cloud Functions, but you have an Express backend at localhost:5001. The endpoints didn't match and the frontend couldn't connect.

### The Solution
1. ✅ Updated backend routes to `/api/upload` and `/api/query`
2. ✅ Created new API client (`frontend/src/lib/backendApi.ts`) for Express backend
3. ✅ Updated frontend components to use new backend API
4. ✅ Configured CORS properly for frontend-backend communication
5. ✅ Created `.env.example` files with all required configuration

## Quick Setup (3 Steps)

### 1. Configure Environment Variables

**Backend** (`backend/.env.local`):
```bash
cd backend
cp .env.example .env.local
```

Edit `.env.local` and add:
- `OPENAI_API_KEY=sk-proj-xxxxx` (your OpenAI key)
- `PINECONE_API_KEY=pcsk-xxxxx` (your Pinecone key)
- `PINECONE_INDEX_NAME=pdf-chatbot` (your index name)

**Frontend** (`frontend/.env.local`):
```bash
cd frontend
cp .env.example .env.local
```

The default values should work:
- `NEXT_PUBLIC_API_URL=http://localhost:5001`

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### 3. Start Both Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev -- -p 3001
```

## Access the App

Open your browser to: **http://localhost:3001**

## API Endpoints

Your Express backend now exposes:

- `POST http://localhost:5001/api/upload` - Upload PDF and create embeddings
- `POST http://localhost:5001/api/query` - Query the chatbot
- `GET http://localhost:5001/health` - Health check

## Environment Variables Reference

### Backend Required
| Variable | Example | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | `sk-proj-xxxxx` | OpenAI API key |
| `PINECONE_API_KEY` | `pcsk-xxxxx` | Pinecone API key |
| `PINECONE_INDEX_NAME` | `pdf-chatbot` | Name of your Pinecone index |

### Backend Optional
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5001` | Backend server port |
| `FRONTEND_URL` | `http://localhost:3001` | Frontend URL for CORS |
| `PINECONE_REGION` | `us-east-1` | Pinecone region |
| `CHUNK_SIZE` | `1500` | Text chunk size for embeddings |

### Frontend Required
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5001` | Backend API URL |

## Testing

Test the backend is running:
```bash
curl http://localhost:5001/health
```

Expected response: `{"status":"ok"}`

## Troubleshooting

**"Network error contacting /api"**
- Make sure backend is running on port 5001
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

**"OPENAI_API_KEY is not set"**
- Add your OpenAI API key to `backend/.env.local`

**"PINECONE_API_KEY is not set"**
- Add your Pinecone API key to `backend/.env.local`

For detailed troubleshooting, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## Files Changed

### Created
- `frontend/src/lib/backendApi.ts` - New Express backend API client
- `backend/.env.example` - Backend environment template
- `frontend/.env.example` - Frontend environment template
- `SETUP_GUIDE.md` - Comprehensive setup guide
- `QUICK_START.md` - This file

### Modified
- `backend/server.js` - Updated routes and CORS config
- `frontend/src/components/FileUploader.tsx` - Uses new backend API
- `frontend/src/hooks/useChat.ts` - Uses new backend API
- `frontend/src/app/(protected)/chat/page.tsx` - Uses namespace instead of docId

## What Changed in the Flow

**Before** (Firebase Cloud Functions):
1. Upload → Firebase Storage → Cloud Function → Pinecone
2. Query → Cloud Function → Pinecone → OpenAI

**After** (Express Backend):
1. Upload → Express `/api/upload` → Extract text → OpenAI embeddings → Pinecone
2. Query → Express `/api/query` → Pinecone → OpenAI chat

## Next Steps

1. Set up your `.env.local` files with API keys
2. Run `npm install` in both directories
3. Start both servers
4. Upload a PDF and start chatting!

For production deployment, see the [SETUP_GUIDE.md](./SETUP_GUIDE.md) file.
