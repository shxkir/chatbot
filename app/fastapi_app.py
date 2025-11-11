"""FastAPI application exposing PDF ingestion and RAG chat endpoints."""

from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:  # pragma: no cover - fallback when running as script
    from .rag_service import RagService
except ImportError:  # pragma: no cover
    from rag_service import RagService

service = RagService()
app = FastAPI(title="PDF RAG Chatbot", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    doc_id: str
    question: str
    top_k: int | None = None
    temperature: float | None = None


@app.get("/health")
async def health() -> dict[str, str]:
    """Lightweight health check."""
    return {"status": "ok"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)) -> dict:
    """Accept a PDF file, embed it, and store vectors in Pinecone."""
    if file.content_type not in (
        "application/pdf",
        "application/x-pdf",
        "binary/octet-stream",
    ):
        raise HTTPException(status_code=400, detail="Only PDF uploads are supported.")

    payload = await file.read()
    if not payload:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        return service.ingest_pdf(payload, file.filename or "uploaded.pdf")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive log
        raise HTTPException(
            status_code=500, detail="Failed to ingest PDF. Check server logs."
        ) from exc


@app.post("/chat")
async def chat_with_document(request: ChatRequest) -> dict:
    """Answer a question using RAG against the previously uploaded document."""
    try:
        return service.answer_question(
            doc_id=request.doc_id,
            question=request.question,
            top_k=request.top_k,
            temperature=request.temperature or 0.2,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive log
        raise HTTPException(
            status_code=500,
            detail="Unable to answer your question. Check server logs.",
        ) from exc
