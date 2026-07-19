-- Track which admin/employer last touched an application status. Nullable
-- so back-fill isn't required; new PATCH handlers stamp it going forward.
ALTER TABLE "JobApp" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;
