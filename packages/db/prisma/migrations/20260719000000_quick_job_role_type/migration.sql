-- Anonymous quick-post submissions now carry a role_type distinguishing
-- doctor vs therapist vs consultant. Main Job.type column already accepts
-- 'therapist' — no schema change needed there.
ALTER TABLE "QuickJobSubmission" ADD COLUMN IF NOT EXISTS "roleType" VARCHAR(40);
