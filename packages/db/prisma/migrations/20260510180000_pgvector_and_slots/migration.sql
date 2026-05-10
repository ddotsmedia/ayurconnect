-- ─── pgvector: 768-dim embedding column on Herb ─────────────────────────
-- Extension already created in the foundation migration. Add the column +
-- HNSW index for fast cosine similarity. Column is nullable until we run
-- the embed-all admin endpoint.
ALTER TABLE "Herb" ADD COLUMN "embedding" vector(768);

CREATE INDEX IF NOT EXISTS "Herb_embedding_hnsw"
  ON "Herb"
  USING hnsw ("embedding" vector_cosine_ops);

-- ─── DoctorSlot: bookable time slots ─────────────────────────────────────
CREATE TABLE "DoctorSlot" (
    "id"        TEXT NOT NULL,
    "doctorId"  TEXT NOT NULL,
    "startsAt"  TIMESTAMP(3) NOT NULL,
    "endsAt"    TIMESTAMP(3) NOT NULL,
    "status"    TEXT NOT NULL DEFAULT 'open',
    "type"      TEXT NOT NULL DEFAULT 'either',
    "notes"     TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorSlot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DoctorSlot_doctorId_startsAt_idx" ON "DoctorSlot"("doctorId", "startsAt");
CREATE INDEX "DoctorSlot_status_startsAt_idx"   ON "DoctorSlot"("status",   "startsAt");

ALTER TABLE "DoctorSlot" ADD CONSTRAINT "DoctorSlot_doctorId_fkey"
  FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
