-- Indexes for hot directory + cron query paths discovered in May 2026 audit.
-- Every filter on /doctors, /hospitals, /forum, and the appointment-reminder
-- cron was hitting unindexed columns and degrading at scale.

-- Doctor: directory filters (state, district, specialization) + country pairs
CREATE INDEX IF NOT EXISTS "Doctor_country_state_idx"            ON "Doctor"("country", "state");
CREATE INDEX IF NOT EXISTS "Doctor_state_idx"                    ON "Doctor"("state");
CREATE INDEX IF NOT EXISTS "Doctor_district_idx"                 ON "Doctor"("district");
CREATE INDEX IF NOT EXISTS "Doctor_specialization_idx"           ON "Doctor"("specialization");
CREATE INDEX IF NOT EXISTS "Doctor_ccimVerified_createdAt_idx"   ON "Doctor"("ccimVerified", "createdAt");

-- Hospital: mirrors Doctor for the same patterns + type filter
CREATE INDEX IF NOT EXISTS "Hospital_country_state_idx"  ON "Hospital"("country", "state");
CREATE INDEX IF NOT EXISTS "Hospital_state_idx"          ON "Hospital"("state");
CREATE INDEX IF NOT EXISTS "Hospital_district_idx"       ON "Hospital"("district");
CREATE INDEX IF NOT EXISTS "Hospital_type_idx"           ON "Hospital"("type");

-- Appointment: cron reminder query `WHERE status IN (...) AND dateTime BETWEEN ...`
-- fires every 15 min — the existing single-column (status) and (dateTime)
-- indexes weren't combinable.
CREATE INDEX IF NOT EXISTS "Appointment_status_dateTime_idx"  ON "Appointment"("status", "dateTime");

-- Post: forum listing ORDER BY createdAt DESC, optionally filtered by category.
CREATE INDEX IF NOT EXISTS "Post_category_createdAt_idx"  ON "Post"("category", "createdAt");
CREATE INDEX IF NOT EXISTS "Post_createdAt_idx"           ON "Post"("createdAt");

-- Lead.assignedTo cascade: change Restrict (Prisma default) → SetNull so we
-- can delete an admin user without failing on dangling lead assignments.
ALTER TABLE "Lead" DROP CONSTRAINT IF EXISTS "Lead_assignedToId_fkey";
ALTER TABLE "Lead"
  ADD CONSTRAINT "Lead_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── AuditLog: trail for destructive admin actions ───────────────────────
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id"         TEXT PRIMARY KEY,
  "actorId"    TEXT NOT NULL,
  "action"     TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId"   TEXT NOT NULL,
  "before"     JSONB,
  "after"      JSONB,
  "reason"     TEXT,
  "ip"         TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AuditLog_actorId_createdAt_idx"      ON "AuditLog"("actorId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_targetType_targetId_idx"    ON "AuditLog"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_createdAt_idx"       ON "AuditLog"("action", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx"              ON "AuditLog"("createdAt");
