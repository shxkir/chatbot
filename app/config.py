import os
from dataclasses import dataclass
from functools import lru_cache


def _require_env(key: str, default: str | None = None, required: bool = False) -> str:
    """Fetch environment variables with optional requirement enforcement."""
    value = os.getenv(key, default)
    if required and not value:
        raise RuntimeError(f"Environment variable '{key}' is required but missing.")
    return value or ""


@dataclass(frozen=True)
class Settings:
    """Central configuration for the PDF RAG chatbot."""

    openai_api_key: str
    pinecone_api_key: str
    pinecone_index_name: str = "pdf-chatbot-index"
    pinecone_cloud: str = "aws"
    pinecone_region: str = "us-east-1"
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    chunk_size: int = 1200
    chunk_overlap: int = 200
    embedding_batch_size: int = 64
    retrieval_top_k: int = 5

    @classmethod
    def load(cls) -> "Settings":
        return cls(
            openai_api_key=_require_env("OPENAI_API_KEY", required=True),
            pinecone_api_key=_require_env("PINECONE_API_KEY", required=True),
            pinecone_index_name=_require_env(
                "PINECONE_INDEX_NAME", default="pdf-chatbot-index"
            ),
            pinecone_cloud=_require_env("PINECONE_CLOUD", default="aws"),
            pinecone_region=_require_env("PINECONE_REGION", default="us-east-1"),
            openai_chat_model=_require_env("OPENAI_CHAT_MODEL", default="gpt-4o-mini"),
            openai_embedding_model=_require_env(
                "OPENAI_EMBEDDING_MODEL", default="text-embedding-3-small"
            ),
            embedding_dimensions=int(
                _require_env("EMBEDDING_DIMENSIONS", default="1536")
            ),
            chunk_size=int(_require_env("CHUNK_SIZE", default="1200")),
            chunk_overlap=int(_require_env("CHUNK_OVERLAP", default="200")),
            embedding_batch_size=int(
                _require_env("EMBEDDING_BATCH_SIZE", default="64")
            ),
            retrieval_top_k=int(_require_env("RETRIEVAL_TOP_K", default="5")),
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Singleton accessor so components share the same configuration instance."""
    return Settings.load()
