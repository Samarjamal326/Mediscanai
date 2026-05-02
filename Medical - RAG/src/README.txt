This folder contains the core source files for the RAG pipeline.

Files that will be created here:
  - ingest.ts      <- Run once to embed data and build the vector store
  - embedder.ts    <- Gemini embedding model configuration
  - retriever.ts   <- Similarity search against the FAISS index
  - chain.ts       <- The full RAG chain (retriever + LLM + prompt)
  - server.ts      <- Express API server wrapping the RAG chain
