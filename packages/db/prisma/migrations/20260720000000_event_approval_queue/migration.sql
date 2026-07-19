-- Event approval queue — moderation columns on EventListing.
-- Additive: existing rows preserve their public visibility via the backfill
-- below. Uses text status (not a PG enum) to match the pattern used by every
-- other status column in this schema (Job.status, Article.status, etc).

ALTER TABLE "EventListing"
  ADD COLUMN IF NOT EXISTS "status"           TEXT         NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "verifiedBy"       TEXT,
  ADD COLUMN IF NOT EXISTS "verifiedAt"       TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rejectionReason"  TEXT;

-- FK to User(id). ON DELETE SET NULL so deleting the verifying admin
-- doesn't cascade-delete their approval history.
DO $$ BEGIN
  ALTER TABLE "EventListing"
    ADD CONSTRAINT "EventListing_verifiedBy_fkey"
    FOREIGN KEY ("verifiedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Backfill so no existing public event vanishes after the migration.
-- Rows already flagged isPublished=true are implicitly admin-approved
-- (they were created via the admin UI which only shows to admins), so we
-- mark them approved with the creator as verifier. Drafts stay pending.
UPDATE "EventListing"
SET
  "status"     = 'approved',
  "verifiedAt" = COALESCE("verifiedAt", "createdAt"),
  "verifiedBy" = COALESCE("verifiedBy", "createdBy")
WHERE "isPublished" = TRUE
  AND "status" = 'pending';

-- Query indexes for the approval-queue tabs (status filter) and the
-- public read path (status + published + eventDate).
CREATE INDEX IF NOT EXISTS "EventListing_status_idx"
  ON "EventListing" ("status");
CREATE INDEX IF NOT EXISTS "EventListing_status_isPublished_eventDate_idx"
  ON "EventListing" ("status", "isPublished", "eventDate");
