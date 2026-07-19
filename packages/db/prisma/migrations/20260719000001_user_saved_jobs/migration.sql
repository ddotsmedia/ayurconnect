-- Any-user job bookmarks (heart icon on job cards → /jobs/saved wishlist).
-- Distinct from the existing SavedJob(candidateId, jobId) which is scoped to
-- CandidateProfile — this table lets non-candidate users (doctors, browsing
-- visitors with an account) bookmark jobs too.
CREATE TABLE IF NOT EXISTS "UserSavedJob" (
  "id"      TEXT         PRIMARY KEY,
  "userId"  TEXT         NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "jobId"   TEXT         NOT NULL REFERENCES "Job"("id")  ON DELETE CASCADE,
  "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserSavedJob_userId_jobId_key" ON "UserSavedJob" ("userId", "jobId");
CREATE INDEX        IF NOT EXISTS "UserSavedJob_userId_savedAt_idx" ON "UserSavedJob" ("userId", "savedAt" DESC);
