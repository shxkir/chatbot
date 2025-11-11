"""Thin wrapper around Pinecone index lifecycle & operations."""

from __future__ import annotations

import time
from typing import Any, Iterable

from pinecone import Pinecone, ServerlessSpec

from .config import Settings


class PineconeStore:
    """Manages index creation plus upsert/query helpers."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = Pinecone(api_key=settings.pinecone_api_key)
        self.index = self._init_index()

    def _index_exists(self, name: str) -> bool:
        response = self.client.list_indexes()
        if hasattr(response, "names"):
            return name in response.names()
        if hasattr(response, "indexes"):
            return any(
                getattr(idx, "name", idx.get("name")) == name  # type: ignore[call-arg]
                for idx in response.indexes  # type: ignore[attr-defined]
            )
        if isinstance(response, dict):
            indexes = response.get("indexes", [])
            return any(
                (idx.get("name") if isinstance(idx, dict) else getattr(idx, "name", None))
                == name
                for idx in indexes
            )
        if isinstance(response, Iterable):
            return any(getattr(idx, "name", idx) == name for idx in response)
        return False

    def _wait_until_ready(self, name: str, timeout: int = 120) -> None:
        """Poll until Pinecone index is ready to accept traffic."""
        start = time.time()
        while time.time() - start < timeout:
            description = self.client.describe_index(name)
            status = getattr(description, "status", None)
            ready = False
            if isinstance(status, dict):
                ready = status.get("ready", False)
            elif status:
                ready = getattr(status, "ready", False)
            if ready:
                return
            time.sleep(2)
        raise TimeoutError(f"Pinecone index '{name}' was not ready within {timeout}s.")

    def _init_index(self):
        name = self.settings.pinecone_index_name
        if not self._index_exists(name):
            self.client.create_index(
                name=name,
                dimension=self.settings.embedding_dimensions,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud=self.settings.pinecone_cloud,
                    region=self.settings.pinecone_region,
                ),
            )
        self._wait_until_ready(name)
        return self.client.Index(name)

    def upsert(
        self, vectors: list[dict[str, Any]], namespace: str | None = None
    ) -> None:
        """Upsert a batch of vectors into Pinecone."""
        if not vectors:
            return
        self.index.upsert(vectors=vectors, namespace=namespace)

    def query(
        self,
        vector: list[float],
        namespace: str | None = None,
        top_k: int = 5,
        include_metadata: bool = True,
    ):
        """Proxy to Pinecone's query method."""
        return self.index.query(
            vector=vector,
            top_k=top_k,
            include_metadata=include_metadata,
            namespace=namespace,
        )
