"""Streamlit UI for interacting with the PDF RAG chatbot locally."""

from __future__ import annotations

import streamlit as st

try:  # pragma: no cover - fallback when streamlit runs file directly
    from .rag_service import RagService
except ImportError:  # pragma: no cover
    from rag_service import RagService

st.set_page_config(page_title="PDF RAG Chatbot", page_icon="🗂️")
st.title("PDF ➜ Pinecone ➜ Chatbot")
st.caption("Upload a PDF, store it as vectors in Pinecone, then ask grounded questions.")

if "rag_service" not in st.session_state:
    st.session_state.rag_service = RagService()

if "doc_id" not in st.session_state:
    st.session_state.doc_id = ""

rag_service: RagService = st.session_state.rag_service

with st.sidebar:
    st.header("1. Upload PDF")
    uploaded = st.file_uploader("Choose a PDF", type=["pdf"])
    if uploaded and st.button("Process PDF", type="primary"):
        with st.spinner("Reading and embedding PDF..."):
            try:
                result = rag_service.ingest_pdf(uploaded.read(), uploaded.name)
            except Exception as exc:  # pragma: no cover - UI feedback only
                st.error(f"Failed to process PDF: {exc}")
            else:
                st.session_state.doc_id = result["doc_id"]
                st.success(
                    f"Stored {result['chunks_indexed']} chunks under doc_id={result['doc_id']}."
                )

st.header("2. Ask a question")
current_doc_id = st.text_input(
    "Active doc_id",
    value=st.session_state.doc_id,
    placeholder="Upload a PDF to generate a doc_id.",
)
question = st.text_area(
    "Question",
    placeholder="What does this document say about ...?",
)

cols = st.columns(2)
with cols[0]:
    top_k = st.number_input("Top-K Chunks", value=5, min_value=1, max_value=20)
with cols[1]:
    temperature = st.slider("Answer Creativity", min_value=0.0, max_value=1.0, value=0.2)

if st.button("Ask", type="primary", disabled=not (current_doc_id and question.strip())):
    with st.spinner("Querying Pinecone and generating answer..."):
        try:
            response = rag_service.answer_question(
                doc_id=current_doc_id.strip(),
                question=question.strip(),
                top_k=top_k,
                temperature=temperature,
            )
        except Exception as exc:  # pragma: no cover - UI feedback only
            st.error(f"Failed to answer question: {exc}")
        else:
            st.subheader("Answer")
            st.write(response["answer"])
            st.subheader("Retrieved Context")
            for reference in response.get("references", []):
                score = reference.get("score")
                score_label = f"{score:.3f}" if isinstance(score, (int, float)) else "n/a"
                page = reference.get("page", "?")
                with st.expander(
                    f"Rank {reference.get('rank')} • Page {page} • Score {score_label}"
                ):
                    st.write(reference.get("text_preview", ""))
