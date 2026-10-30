import os
import hashlib
import numpy as np
from typing import List, Dict, Any, Optional
from app.config import get_settings

settings = get_settings()

try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False


def get_mock_embedding(text: str, dim: int = 128) -> List[float]:
    """Generate a deterministic normalized embedding vector from text."""
    seed = int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:8], 16)
    rng = np.random.default_rng(seed)
    vec = rng.standard_normal(dim)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()


class FallbackCollection:
    """In-memory collection fallback if ChromaDB is unavailable."""
    def __init__(self, name: str):
        self.name = name
        self.documents: Dict[str, Dict[str, Any]] = {}

    def add(self, ids: List[str], documents: List[str], metadatas: Optional[List[Dict[str, Any]]] = None, embeddings: Optional[List[List[float]]] = None):
        for idx, item_id in enumerate(ids):
            emb = embeddings[idx] if embeddings else get_mock_embedding(documents[idx])
            meta = metadatas[idx] if metadatas else {}
            self.documents[item_id] = {
                "id": item_id,
                "document": documents[idx],
                "metadata": meta,
                "embedding": emb,
            }

    def query(self, query_texts: Optional[List[str]] = None, query_embeddings: Optional[List[List[float]]] = None, n_results: int = 5):
        if not self.documents:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

        target_emb = query_embeddings[0] if query_embeddings else get_mock_embedding(query_texts[0])
        target_norm = np.linalg.norm(target_emb)

        scored = []
        for doc_id, doc in self.documents.items():
            emb = np.array(doc["embedding"])
            # Cosine similarity
            sim = np.dot(target_emb, emb) / (target_norm * np.linalg.norm(emb) + 1e-9)
            # Distance = 1 - sim
            dist = float(max(0.0, 1.0 - sim))
            scored.append((dist, doc_id, doc["document"], doc["metadata"]))

        scored.sort(key=lambda x: x[0])
        top_k = scored[:n_results]

        return {
            "ids": [[x[1] for x in top_k]],
            "documents": [[x[2] for x in top_k]],
            "metadatas": [[x[3] for x in top_k]],
            "distances": [[x[0] for x in top_k]],
        }

    def count(self) -> int:
        return len(self.documents)


class VectorStore:
    def __init__(self):
        self.persist_dir = settings.CHROMA_PERSIST_DIRECTORY
        os.makedirs(self.persist_dir, exist_ok=True)
        self.client = None
        self.resumes_col = None
        self.jobs_col = None

        if CHROMADB_AVAILABLE:
            try:
                self.client = chromadb.PersistentClient(path=self.persist_dir)
                self.resumes_col = self.client.get_or_create_collection("resumes")
                self.jobs_col = self.client.get_or_create_collection("job_descriptions")
            except Exception as e:
                # Fallback to in-memory if disk lock or initialization error occurs
                print(f"[VectorStore] ChromaDB init error, using fallback: {e}")
                self.resumes_col = FallbackCollection("resumes")
                self.jobs_col = FallbackCollection("job_descriptions")
        else:
            self.resumes_col = FallbackCollection("resumes")
            self.jobs_col = FallbackCollection("job_descriptions")

    def embed_text(self, text: str) -> List[float]:
        # If OpenAI key is present and provider is openai, could call OpenAI, otherwise mock embedding
        return get_mock_embedding(text)

    def store_resume(self, candidate_id: str, resume_text: str, metadata: Dict[str, Any]):
        emb = self.embed_text(resume_text)
        self.resumes_col.add(
            ids=[candidate_id],
            documents=[resume_text],
            metadatas=[metadata],
            embeddings=[emb]
        )

    def store_job(self, job_id: str, job_text: str, metadata: Dict[str, Any]):
        emb = self.embed_text(job_text)
        self.jobs_col.add(
            ids=[job_id],
            documents=[job_text],
            metadatas=[metadata],
            embeddings=[emb]
        )

    def calculate_similarity(self, text_a: str, text_b: str) -> float:
        """Calculate cosine similarity score between 0.0 and 100.0."""
        emb_a = np.array(self.embed_text(text_a))
        emb_b = np.array(self.embed_text(text_b))
        dot = np.dot(emb_a, emb_b)
        norm_a = np.linalg.norm(emb_a)
        norm_b = np.linalg.norm(emb_b)
        if norm_a == 0 or norm_b == 0:
            return 50.0
        cos_sim = float(dot / (norm_a * norm_b))
        # Map cosine similarity [-1, 1] to [0, 100]
        score = max(0.0, min(100.0, (cos_sim + 1.0) / 2.0 * 100.0))
        return round(score, 1)


vector_store = VectorStore()

