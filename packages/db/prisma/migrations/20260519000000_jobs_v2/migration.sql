-- Jobs feature augmentation (2026-05-19).
-- Extends the existing thin Job model with hiring/availability discriminator,
-- moderation workflow, structured fields, and a JobApplication table.

ALTER TABLE "Job"
  ADD COLUMN IF NOT EXISTS "kind"            TEXT      NOT NULL DEFAULT 'hiring',
  ADD COLUMN IF NOT EXISTS "status"          TEXT      NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS "clinic"          TEXT,
  ADD COLUMN IF NOT EXISTS "location"        TEXT,
  ADD COLUMN IF NOT EXISTS "specialty"       TEXT,
  ADD COLUMN IF NOT EXISTS "qualifications"  TEXT[]    NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "expMin"          INTEGER,
  ADD COLUMN IF NOT EXISTS "expMax"          INTEGER,
  ADD COLUMN IF NOT EXISTS "currency"        TEXT,
  ADD COLUMN IF NOT EXISTS "salaryMin"       INTEGER,
  ADD COLUMN IF NOT EXISTS "salaryMax"       INTEGER,
  ADD COLUMN IF NOT EXISTS "deadline"        TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "remote"          BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "urgent"          BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "featured"        BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "tags"            TEXT[]    NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "requirements"    TEXT[]    NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "benefits"        TEXT[]    NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "contactEmail"    TEXT,
  ADD COLUMN IF NOT EXISTS "logoInitials"    TEXT,
  ADD COLUMN IF NOT EXISTS "logoColor"       TEXT,
  ADD COLUMN IF NOT EXISTS "postedByRole"    TEXT,
  ADD COLUMN IF NOT EXISTS "reviewedAt"      TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reviewedById"    TEXT,
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "internalNotes"   TEXT,
  ADD COLUMN IF NOT EXISTS "availFrom"       TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "availDurationDays" INTEGER,
  ADD COLUMN IF NOT EXISTS "contactKind"     TEXT,
  ADD COLUMN IF NOT EXISTS "contactValue"    TEXT;

CREATE INDEX IF NOT EXISTS "Job_status_kind_featured_createdAt_idx" ON "Job"("status", "kind", "featured", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Job_specialty_idx" ON "Job"("specialty");

CREATE TABLE IF NOT EXISTS "JobApplication" (
  "id"              TEXT PRIMARY KEY,
  "jobId"           TEXT NOT NULL,
  "applicantUserId" TEXT,
  "name"            TEXT NOT NULL,
  "email"           TEXT NOT NULL,
  "phone"           TEXT NOT NULL,
  "qualification"   TEXT,
  "experience"      TEXT,
  "coverNote"       TEXT,
  "status"          TEXT NOT NULL DEFAULT 'new',
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE,
  CONSTRAINT "JobApplication_applicantUserId_fkey" FOREIGN KEY ("applicantUserId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "JobApplication_jobId_email_key" ON "JobApplication"("jobId", "email");
CREATE INDEX IF NOT EXISTS "JobApplication_jobId_status_idx" ON "JobApplication"("jobId", "status");
CREATE INDEX IF NOT EXISTS "JobApplication_applicantUserId_idx" ON "JobApplication"("applicantUserId");
