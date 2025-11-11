# PDF RAG Chatbot - Setup Guide

This guide will help you set up and run your PDF RAG chatbot with Next.js frontend (port 3001) and Express backend (port 5001).

## Architecture Overview

- **Frontend**: Next.js app on `http://localhost:3001`
- **Backend**: Express.js API on `http://localhost:5001`
  - `/api/upload` - Upload PDF, extract text, create embeddings, store in Pinecone
  - `/api/query` - Query the chatbot with a question
- **Vector Database**: Pinecone for storing document embeddings
- **AI**: OpenAI for embeddings and chat completions

## Prerequisites

1. **Node.js** (v18 or higher)
2. **OpenAI API Key** - Get one at https://platform.openai.com/api-keys
3. **Pinecone API Key** - Sign up at https://www.pinecone.io/

## Step 1: Environment Setup

### Backend Environment (.env.local)

Create `/backend/.env.local` from the example:

```bash
cd backend
cp .env.example .env.local
```

Edit `backend/.env.local` and fill in your API keys:

```env
# Server Configuration
PORT=5001
FRONTEND_URL=http://localhost:3001

# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx  # Your actual OpenAI API key
OPENAI_EMBED_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini

# Pinecone Configuration
PINECONE_API_KEY=pcsk_xxxxxxxxxxxxx  # Your actual Pinecone API key
PINECONE_INDEX_NAME=pdf-chatbot
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1

# Document Processing Configuration
EMBEDDING_DIMENSIONS=1536
CHUNK_SIZE=1500
CHUNK_OVERLAP=200
EMBEDDING_BATCH_SIZE=64
RETRIEVAL_TOP_K=5
```

### Frontend Environment (.env.local)

Create `/frontend/.env.local` from the example:

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5001

# Next.js Configuration
NEXT_PUBLIC_PORT=3001
```

## Step 2: Install Dependencies

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Step 3: Create Pinecone Index

1. Go to https://www.pinecone.io/ and sign in
2. Create a new index with these settings:
   - **Name**: `pdf-chatbot` (or whatever you set in PINECONE_INDEX_NAME)
   - **Dimensions**: `1536` (for text-embedding-3-small model)
   - **Metric**: `cosine`
   - **Cloud**: `AWS` (or your preference)
   - **Region**: `us-east-1` (or your preference)

**Note**: The backend will automatically try to create the index if it doesn't exist, but it's better to create it manually first.

## Step 4: Start the Servers

You need to run both servers in separate terminal windows.

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
Backend listening on http://localhost:5001
```

### Terminal 2: Start Frontend Server

```bash
cd frontend
npm run dev -- -p 3001
```

You should see:
```
- ready started server on 0.0.0.0:3001, url: http://localhost:3001
```

## Step 5: Test the Application

1. Open your browser and go to `http://localhost:3001`
2. Upload a PDF file
3. Wait for processing (extracting text, creating embeddings, storing in Pinecone)
4. Start chatting with your document!

## Troubleshooting

### Backend not running / Network error

**Error**: `Network error contacting /api → http://localhost:5001`

**Solutions**:
1. Make sure the backend server is running (check Terminal 1)
2. Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local` is set to `http://localhost:5001`
3. Check that port 5001 is not being used by another process:
   ```bash
   lsof -i :5001
   ```

### CORS errors

**Error**: Browser console shows CORS policy errors

**Solution**: The backend is configured to allow requests from `http://localhost:3001`. If you change the frontend port, update `FRONTEND_URL` in `backend/.env.local`.

### OpenAI API errors

**Error**: `401 Unauthorized` or `Invalid API key`

**Solution**:
1. Verify your OpenAI API key in `backend/.env.local`
2. Make sure you have credits in your OpenAI account
3. Check the key format starts with `sk-proj-` or `sk-`

### Pinecone errors

**Error**: `Index not found` or `Unauthorized`

**Solutions**:
1. Verify your Pinecone API key in `backend/.env.local`
2. Make sure the index name matches exactly (case-sensitive)
3. Check that the index dimension is 1536
4. Verify the cloud and region settings match your index

### PDF upload fails

**Error**: `No chunks could be derived from PDF`

**Solutions**:
1. Make sure the PDF contains extractable text (not just images)
2. Try a different PDF file
3. Check the backend logs for more details

## Testing the Backend API Directly

You can test the backend API using curl:

### Test Health Endpoint
```bash
curl http://localhost:5001/health
```

Expected response:
```json
{"status":"ok"}
```

### Test Upload Endpoint
```bash
curl -X POST http://localhost:5001/api/upload \
  -F "file=@/path/to/your/document.pdf"
```

Expected response:
```json
{
  "message": "PDF ingested successfully",
  "docId": "uuid-here",
  "namespace": "uuid-here",
  "chunksIndexed": 42
}
```

### Test Query Endpoint
```bash
curl -X POST http://localhost:5001/api/query \
  -H "Content-Type: application/json" \
  -d '{"message":"What is this document about?","namespace":"your-namespace-from-upload"}'
```

Expected response:
```json
{
  "reply": "This document is about...",
  "references": [
    {
      "rank": 1,
      "score": 0.89,
      "textPreview": "Text snippet from the document..."
    }
  ]
}
```

## Production Deployment

For production deployment:

1. **Backend**: Deploy to a platform like Railway, Render, or AWS
   - Set environment variables through the platform's dashboard
   - Update `FRONTEND_URL` to your production frontend URL

2. **Frontend**: Deploy to Vercel, Netlify, or your preferred host
   - Set `NEXT_PUBLIC_API_URL` to your production backend URL
   - Make sure to set this as a build-time environment variable

3. **Security Considerations**:
   - Never commit `.env.local` files to git
   - Use proper authentication (the app currently has no auth for the backend API)
   - Consider rate limiting on the backend
   - Add input validation and sanitization

## Development Tips

### Running in Development Mode

Backend with auto-reload:
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart on changes
```

Frontend with auto-reload:
```bash
cd frontend
npm run dev -- -p 3001  # Hot reload enabled by default
```

### Checking Logs

Backend logs appear in the terminal where you ran `npm run dev`.
Frontend logs appear in both the terminal and browser console.

### Environment Variables Priority

The backend looks for environment variables in this order:
1. `backend/.env.local` (highest priority)
2. `backend/.env`
3. System environment variables

## Common API Responses

### Successful Upload
```json
{
  "message": "PDF ingested successfully",
  "docId": "550e8400-e29b-41d4-a716-446655440000",
  "namespace": "550e8400-e29b-41d4-a716-446655440000",
  "chunksIndexed": 127
}
```

### Successful Query
```json
{
  "reply": "Based on the document, the answer is...",
  "references": [
    {
      "rank": 1,
      "score": 0.923,
      "textPreview": "The relevant section states that..."
    }
  ]
}
```

### Error Response
```json
{
  "error": "Detailed error message here"
}
```

## Need Help?

If you encounter issues not covered in this guide:

1. Check the browser console for frontend errors
2. Check the backend terminal for server errors
3. Verify all environment variables are set correctly
4. Make sure both servers are running
5. Test the backend API directly with curl
