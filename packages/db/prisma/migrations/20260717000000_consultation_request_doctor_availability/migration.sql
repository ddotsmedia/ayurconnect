-- Public consultation request submissions (site form + WhatsApp fallback).
-- Admin CRM at /admin/consultation-requests works this table.
CREATE TABLE IF NOT EXISTS "ConsultationRequest" (
  "id"                TEXT PRIMARY KEY,
  "name"              TEXT        NOT NULL,
  "phone"             TEXT        NOT NULL,
  "email"             TEXT,
  "concern"           TEXT        NOT NULL,
  "preferredLanguage" TEXT        NOT NULL,
  "preferredTime"     TEXT        NOT NULL DEFAULT 'Any',
  "country"           TEXT,
  "status"            TEXT        NOT NULL DEFAULT 'NEW',
  "adminNotes"        TEXT,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ConsultationRequest_status_createdAt_idx"
  ON "ConsultationRequest" ("status", "createdAt" DESC);

-- Doctor availability signals surfaced on /doctors cards and
-- /online-consultation "available doctors" strip.
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "respondsWithin" TEXT;
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "availableToday" BOOLEAN NOT NULL DEFAULT FALSE;
