import os
import sys
import uuid
from dotenv import load_dotenv

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load env variables
load_dotenv()

from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

MAX_ROWS_LARGE_FILE = 2000  # We can increase this back up since local embeddings are unlimited!
LARGE_FILE_THRESHOLD = 5000
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 100

PINECONE_INDEX_NAME = "medical-rag"
EMBEDDING_DIMENSION = 384  # Dimension for all-MiniLM-L6-v2

print("[*] Loading local embedding model (all-MiniLM-L6-v2)...")
embedder = SentenceTransformer('all-MiniLM-L6-v2')


def get_all_files(dir_path: str) -> list[str]:
    """Recursively find all .pdf and .csv files under dir_path."""
    result = []
    for root, _, files in os.walk(dir_path):
        for f in files:
            if f.endswith(".pdf") or f.endswith(".csv"):
                result.append(os.path.join(root, f))
    return result


def split_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split a long string into overlapping chunks."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks


def load_pdf(file_path: str) -> list[dict]:
    """Extract text from a PDF, one document per page."""
    try:
        from pypdf import PdfReader
    except ImportError:
        print("   [ERR] pypdf not installed.")
        return []

    reader = PdfReader(file_path)
    docs = []
    for page_num, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        if text.strip():
            docs.append({"text": text, "source": file_path, "page": page_num})
    return docs


def load_csv(file_path: str) -> list[dict]:
    """Load a CSV file, sampling large files for performance."""
    try:
        import pandas as pd
    except ImportError:
        print("   [ERR] pandas not installed.")
        return []

    df = pd.read_csv(file_path, on_bad_lines="skip", encoding="utf-8")
    total_rows = len(df)

    if total_rows > LARGE_FILE_THRESHOLD:
        df = df.sample(n=MAX_ROWS_LARGE_FILE, random_state=42)
        print(f"   [*] Large file: {total_rows} rows -> sampled {len(df)}")
    else:
        print(f"   [*] Small file: loading all {total_rows} rows")

    header = ",".join(df.columns.tolist())
    docs = []
    for i, row in df.iterrows():
        line = ",".join(str(v) for v in row.values)
        docs.append({"text": f"{header}\n{line}", "source": file_path, "row": i})
    return docs


def generate_embedding(text: str) -> list[float]:
    """Generate a 384-dimensional embedding locally."""
    # embedder.encode returns a numpy array, we convert to list for Pinecone
    return embedder.encode(text).tolist()


def chunk_and_embed():
    print("[*] Connecting to Pinecone...")
    pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))

    # Create index if it doesn't exist
    if PINECONE_INDEX_NAME not in pc.list_indexes().names():
        print(f"[*] Creating new Pinecone index: '{PINECONE_INDEX_NAME}'...")
        pc.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=EMBEDDING_DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
    else:
        print(f"[*] Found existing Pinecone index: '{PINECONE_INDEX_NAME}'")

    index = pc.Index(PINECONE_INDEX_NAME)

    print("\n[*] Loading documents...\n")
    all_files = get_all_files(DATA_DIR)
    print(f"[*] Found {len(all_files)} files to process.")

    all_docs: list[dict] = []
    for file_path in all_files:
        print(f"[*] Loading: {os.path.basename(file_path)}")
        try:
            if file_path.endswith(".pdf"):
                docs = load_pdf(file_path)
                all_docs.extend(docs)
                print(f"   [OK] {len(docs)} pages")
            elif file_path.endswith(".csv"):
                docs = load_csv(file_path)
                all_docs.extend(docs)
                print(f"   [OK] {len(docs)} rows")
        except Exception as e:
            print(f"   [ERR] Failed: {e}")

    print(f"\n[*] Total documents loaded: {len(all_docs)}")
    print("[*] Splitting into chunks and generating embeddings locally...")

    vectors_to_upload = []
    total_uploaded = 0

    # Process and upload in batches
    for i, doc in enumerate(all_docs):
        text_chunks = split_text(doc["text"])
        
        for j, chunk_text in enumerate(text_chunks):
            if not chunk_text.strip():
                continue
                
            try:
                embedding = generate_embedding(chunk_text)
                vector_id = f"doc_{i}_chunk_{j}_{str(uuid.uuid4())[:8]}"
                
                vectors_to_upload.append({
                    "id": vector_id,
                    "values": embedding,
                    "metadata": {
                        "text": chunk_text,
                        "source": os.path.basename(doc.get("source", "unknown"))
                    }
                })
            except Exception as e:
                print(f"   [WARN] Embedding failed for a chunk: {e}")

            # Upload when batch hits 100 (Pinecone accepts 100 easily)
            if len(vectors_to_upload) >= 100:
                print(f"[*] Uploading batch of 100 to Pinecone... (Total: {total_uploaded})")
                index.upsert(vectors=vectors_to_upload)
                total_uploaded += len(vectors_to_upload)
                vectors_to_upload = []

    # Upload any remaining
    if vectors_to_upload:
        print(f"[*] Uploading final batch to Pinecone... (Total: {total_uploaded})")
        index.upsert(vectors=vectors_to_upload)
        total_uploaded += len(vectors_to_upload)

    print(f"\n[OK] Ingestion complete! Uploaded {total_uploaded} embedded chunks to Pinecone.")


if __name__ == "__main__":
    chunk_and_embed()
