"""High-level orchestration for ingesting PDFs and answering questions via RAG."""

from __future__ import annotations

from typing import Any, Dict, List
from uuid import uuid4

from openai import OpenAI

from .config import Settings, get_settings
from .pdf_processing import build_chunks, extract_text_from_pdf
from .pinecone_store import PineconeStore


class RagService:
    """Encapsulates embedding, storage, and retrieval logic."""

    def __init__(self, settings: Settings | None = None):
        self.settings = settings or get_settings()
        self._pinecone = PineconeStore(self.settings)
        self._openai = OpenAI(api_key=self.settings.openai_api_key)

    def _embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed text in small batches to stay within API limits."""
        embeddings: List[List[float]] = []
        batch_size = self.settings.embedding_batch_size
        for start in range(0, len(texts), batch_size):
            batch = texts[start : start + batch_size]
            response = self._openai.embeddings.create(
                model=self.settings.openai_embedding_model,
                input=batch,
            )
            embeddings.extend([record.embedding for record in response.data])
        return embeddings

    def ingest_pdf(self, pdf_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Convert a PDF to embeddings and store them inside Pinecone."""
        pages = extract_text_from_pdf(pdf_bytes)
        if not pages:
            raise ValueError("No readable text was found inside the uploaded PDF.")

        chunks = build_chunks(
            pages, self.settings.chunk_size, self.settings.chunk_overlap
        )
        if not chunks:
            raise ValueError("Unable to build text chunks from the uploaded PDF.")

        doc_id = str(uuid4())
        texts = [chunk["text"] for chunk in chunks]
        embeddings = self._embed_texts(texts)

        vectors = []
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            metadata = {
                "text": chunk["text"],
                "page": chunk["page"],
                "chunk": chunk["chunk"],
                "source": filename,
                "doc_id": doc_id,
            }
            vectors.append(
                {
                    "id": f"{doc_id}-{idx}",
                    "values": embedding,
                    "metadata": metadata,
                }
            )

        self._pinecone.upsert(vectors=vectors, namespace=doc_id)
        return {
            "doc_id": doc_id,
            "chunks_indexed": len(vectors),
            "source": filename,
        }

    def answer_question(
        self,
        doc_id: str,
        question: str,
        top_k: int | None = None,
        temperature: float = 0.2,
    ) -> Dict[str, Any]:
        """Perform retrieval augmented generation for a stored document."""
        if not doc_id:
            raise ValueError("doc_id is required.")
        if not question:
            raise ValueError("question is required.")

        query_embedding = self._embed_texts([question])[0]
        top_k = top_k or self.settings.retrieval_top_k
        pinecone_response = self._pinecone.query(
            vector=query_embedding,
            namespace=doc_id,
            top_k=top_k,
            include_metadata=True,
        )

        matches = getattr(pinecone_response, "matches", None)
        if matches is None and isinstance(pinecone_response, dict):
            matches = pinecone_response.get("matches", [])
        if matches is None:
            matches = []
        if not matches:
            return {
                "answer": "I could not find relevant context in Pinecone for that question.",
                "doc_id": doc_id,
                "references": [],
            }

        contexts = []
        references = []
        for rank, match in enumerate(matches, start=1):
            metadata = getattr(match, "metadata", None) or match.get("metadata", {})
            text = metadata.get("text", "")
            page = metadata.get("page")
            score = getattr(match, "score", None) or match.get("score")
            contexts.append(f"[Page {page}] {text}")
            references.append(
                {
                    "rank": rank,
                    "page": page,
                    "score": score,
                    "text_preview": text[:200],
                }
            )

        system_prompt = (
            "You are an assistant that answers questions using only the provided context. "
            "If the answer is not contained in the context, state that clearly instead of improvising."
        )
        context_block = "\n\n".join(contexts)
        user_prompt = (
            f"Context:\n{context_block}\n\n"
            f"Question: {question}\n"
            "Answer using the context above and cite page numbers when helpful."
        )

        completion = self._openai.chat.completions.create(
            model=self.settings.openai_chat_model,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        answer = completion.choices[0].message.content.strip()
        return {
            "answer": answer,
            "doc_id": doc_id,
            "references": references,
        }
