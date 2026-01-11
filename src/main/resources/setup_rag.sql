-- Create the embeddings table for LangChain4j
CREATE TABLE IF NOT EXISTS embeddings (
    embedding_id UUID PRIMARY KEY,
    embedding vector(384),
    text TEXT,
    metadata JSONB
);

-- Create an HNSW index for faster similarity search
-- Note: 'lists' parameter can be adjusted based on data size (e.g., rows / 1000)
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings USING hnsw (embedding vector_cosine_ops);
