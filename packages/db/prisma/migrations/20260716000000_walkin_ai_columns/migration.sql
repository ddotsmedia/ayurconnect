-- Enhanced walk-in interview fields on Job (additive; all nullable).
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "walkInLastDate"     TIMESTAMP(3);
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "walkInContactPhone" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "walkInRequiredDocs" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "walkInMapUrl"       TEXT;

-- Anonymous quick-post submissions (no auth required; admin reviews).
CREATE TABLE IF NOT EXISTS "QuickJobSubmission" (
  "id"              TEXT PRIMARY KEY,
  "title"           TEXT        NOT NULL,
  "location"        TEXT        NOT NULL,
  "contactWhatsapp" TEXT        NOT NULL,
  "salary"          TEXT,
  "specialty"       TEXT,
  "description"     TEXT,
  "isWalkIn"        BOOLEAN     NOT NULL DEFAULT FALSE,
  "walkInDate"      TEXT,
  "walkInTime"      TEXT,
  "walkInVenue"     TEXT,
  "source"          TEXT        NOT NULL DEFAULT 'quick-post',
  "status"          TEXT        NOT NULL DEFAULT 'pending',
  "reviewedAt"      TIMESTAMP(3),
  "reviewedById"    TEXT,
  "publishedJobId"  TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "QuickJobSubmission_status_createdAt_idx" ON "QuickJobSubmission" ("status", "createdAt" DESC);
