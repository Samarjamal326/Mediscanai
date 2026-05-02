import os
import sys
from dotenv import load_dotenv

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load env variables
load_dotenv()

from sentence_transformers import SentenceTransformer
from pinecone import Pinecone

PINECONE_INDEX_NAME = "medical-rag"

# Load local embedding model (runs offline and is very fast)
# Note: It loads into memory once when retriever.py is imported
embedder = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize Pinecone globally to reuse the connection pool
print("[*] Initializing Pinecone client...")
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index = pc.Index(PINECONE_INDEX_NAME)

def generate_embedding(text: str) -> list[float]:
    """Generate a 384-dimensional embedding for the query."""
    return embedder.encode(text).tolist()


def retrieve(query: str, top_k: int = 4) -> list[dict]:
    """Retrieve the most relevant chunks using Pinecone semantic search."""
    try:
        # 1. Embed the query
        print("[*] Embedding query for semantic search...")
        query_vector = generate_embedding(query)

        # 3. Query Pinecone
        print("[*] Searching Pinecone vector database...")
        search_results = index.query(
            vector=query_vector,
            top_k=top_k,
            include_metadata=True
        )

        chunks = []
        print("\n[*] Top retrieved chunks:")
        for i, match in enumerate(search_results.matches):
            score = match.score
            text = match.metadata.get("text", "")
            source = match.metadata.get("source", "Unknown")
            print(f"   {i+1}. [Score: {score:.3f}] {source}")
            chunks.append({"text": text, "source": source})

        return chunks

    except Exception as e:
        print(f"[ERR] Retrieval Error: {e}")
        return []
