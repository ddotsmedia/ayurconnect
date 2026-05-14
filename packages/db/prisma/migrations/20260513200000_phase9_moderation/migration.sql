-- Phase 9 — Doctor + Hospital approval workflow (2026-05-13)
-- Adds moderationStatus, reason, internal notes, last-reviewed-by trail.

ALTER TABLE "Doctor"
  ADD COLUMN IF NOT EXISTS "moderationStatus" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "moderationReason" TEXT,
  ADD COLUMN IF NOT EXISTS "moderationNotes"  JSONB,
  ADD COLUMN IF NOT EXISTS "lastReviewedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastReviewedById" TEXT;

ALTER TABLE "Hospital"
  ADD COLUMN IF NOT EXISTS "moderationStatus" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "moderationReason" TEXT,
  ADD COLUMN IF NOT EXISTS "moderationNotes"  JSONB,
  ADD COLUMN IF NOT EXISTS "lastReviewedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastReviewedById" TEXT;

-- FK to User for lastReviewedBy (admin who last touched the record).
ALTER TABLE "Doctor"
  DROP CONSTRAINT IF EXISTS "Doctor_lastReviewedById_fkey";
ALTER TABLE "Doctor"
  ADD CONSTRAINT "Doctor_lastReviewedById_fkey"
  FOREIGN KEY ("lastReviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Hospital"
  DROP CONSTRAINT IF EXISTS "Hospital_lastReviewedById_fkey";
ALTER TABLE "Hospital"
  ADD CONSTRAINT "Hospital_lastReviewedById_fkey"
  FOREIGN KEY ("lastReviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes for queue sorting (oldest pending first).
CREATE INDEX IF NOT EXISTS "Doctor_moderationStatus_createdAt_idx"   ON "Doctor"("moderationStatus", "createdAt");
CREATE INDEX IF NOT EXISTS "Hospital_moderationStatus_createdAt_idx" ON "Hospital"("moderationStatus", "createdAt");

-- Backfill: existing rows that are already ccimVerified → moderationStatus='approved'.
UPDATE "Doctor"   SET "moderationStatus" = 'approved' WHERE "ccimVerified" = true AND "moderationStatus" = 'pending';
UPDATE "Hospital" SET "moderationStatus" = 'approved' WHERE "ccimVerified" = true AND "moderationStatus" = 'pending';
