-- ─── Jobs Phase B/C/E/F — WhatsApp opt-ins, viewCounts, scorecard JSON ─

ALTER TABLE "CandidateProfile"
  ADD COLUMN IF NOT EXISTS "whatsappAlertOptIn"      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "whatsappStatusOptIn"     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "whatsappReminderOptIn"   BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "viewCount"               INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lastDigestSentAt"        TIMESTAMP(3);

ALTER TABLE "EmployerProfile"
  ADD COLUMN IF NOT EXISTS "whatsappApplicationOptIn" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "whatsappDigestOptIn"      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "lastDigestSentAt"         TIMESTAMP(3);

ALTER TABLE "Interview"
  ADD COLUMN IF NOT EXISTS "scorecard"        JSONB,
  ADD COLUMN IF NOT EXISTS "recommendation"   TEXT;

-- Telemedicine + job-form extras live on the existing Job model as JSON tag set;
-- no schema change needed there.
