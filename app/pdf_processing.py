"""Utilities for turning uploaded PDFs into cleaned text chunks."""

from __future__ import annotations

from io import BytesIO
from typing import Iterable

from pypdf import PdfReader


def extract_text_from_pdf(raw_bytes: bytes) -> list[tuple[int, str]]:
    """Return a list of (page_number, text) tuples with whitespace-normalized text."""
    reader = PdfReader(BytesIO(raw_bytes))
    pages: list[tuple[int, str]] = []
    for page_num, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        cleaned = " ".join(text.split())
        if cleaned:
            pages.append((page_num, cleaned))
    return pages


def _chunk_text(text: str, chunk_size: int, overlap: int) -> Iterable[str]:
    """Yield overlapping windows from a single page of text."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    step = max(chunk_size - overlap, 1)
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()
        if chunk:
            yield chunk
        if end >= len(text):
            break
        start += step


def build_chunks(
    pages: list[tuple[int, str]], chunk_size: int, overlap: int
) -> list[dict[str, str | int]]:
    """Chunk every page and carry page metadata along."""
    chunks: list[dict[str, str | int]] = []
    for page_num, text in pages:
        for idx, chunk in enumerate(_chunk_text(text, chunk_size, overlap)):
            chunks.append(
                {
                    "page": page_num,
                    "text": chunk,
                    "chunk": idx,
                }
            )
    return chunks
