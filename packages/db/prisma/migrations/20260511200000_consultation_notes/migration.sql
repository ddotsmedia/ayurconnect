-- Online-consultation clinical record fields on Appointment.
-- Filled by the doctor during / after the call; the patient-facing fields
-- (summary / prescription / treatmentPlan) are surfaced on the post-call
-- consultation page. doctorPrivateNotes are never returned to patient clients.

ALTER TABLE "Appointment"
  ADD COLUMN "consultationStartedAt" TIMESTAMP(3),
  ADD COLUMN "consultationEndedAt"   TIMESTAMP(3),
  ADD COLUMN "consultationSummary"   TEXT,
  ADD COLUMN "prescription"          TEXT,
  ADD COLUMN "treatmentPlan"         TEXT,
  ADD COLUMN "doctorPrivateNotes"    TEXT,
  ADD COLUMN "followUpRecommended"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "followUpAfterWeeks"    INTEGER;
