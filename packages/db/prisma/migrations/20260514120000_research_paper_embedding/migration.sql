-- ─── pgvector: 768-dim embedding column on ResearchPaper ────────────────
-- Mirrors the Herb embedding column (20260510180000_pgvector_and_slots).
-- Powers the Doctor Hub's AI Research Assistant: instead of keyword OR-match
-- on abstracts, we now retrieve by cosine similarity to the query's embedding.
-- Column is nullable; the API boot loop in apps/api/src/app.ts onReady embeds
-- any papers missing a vector.
ALTER TABLE "ResearchPaper" ADD COLUMN IF NOT EXISTS "embedding" vector(768);

CREATE INDEX IF NOT EXISTS "ResearchPaper_embedding_hnsw"
  ON "ResearchPaper"
  USING hnsw ("embedding" vector_cosine_ops);
