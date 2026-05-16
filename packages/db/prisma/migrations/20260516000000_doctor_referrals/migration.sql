-- Doctor-to-doctor referrals (2026-05-16).
-- When a doctor in the hub recognizes a case is outside their specialty / scope
-- they refer the patient to another verified doctor. Tracked separately from
-- Appointment so it's a clean "inbox" surface in the doctor hub.

CREATE TABLE IF NOT EXISTS "DoctorReferral" (
  "id"             TEXT PRIMARY KEY,
  "fromDoctorId"   TEXT NOT NULL,
  "toDoctorId"     TEXT NOT NULL,
  "patientName"    TEXT NOT NULL,
  "patientEmail"   TEXT,
  "patientPhone"   TEXT,
  "patientAge"     INTEGER,
  "specialty"      TEXT,                                    -- e.g. 'panchakarma', 'prasuti-tantra'
  "condition"      TEXT,                                    -- one-line clinical headline
  "reason"         TEXT NOT NULL,                           -- why this referral, in the referrer's words
  "urgency"        TEXT NOT NULL DEFAULT 'routine',         -- 'routine' | 'soon' | 'urgent'
  "caseId"         TEXT,                                    -- optional link to a ClinicalCase
  "status"         TEXT NOT NULL DEFAULT 'pending',         -- 'pending' | 'accepted' | 'declined' | 'completed'
  "responseNote"   TEXT,
  "respondedAt"    TIMESTAMP(3),
  "completedAt"    TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DoctorReferral_fromDoctorId_fkey" FOREIGN KEY ("fromDoctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE,
  CONSTRAINT "DoctorReferral_toDoctorId_fkey"   FOREIGN KEY ("toDoctorId")   REFERENCES "Doctor"("id") ON DELETE CASCADE,
  CONSTRAINT "DoctorReferral_caseId_fkey"       FOREIGN KEY ("caseId")       REFERENCES "ClinicalCase"("id") ON DELETE SET NULL
);

-- Hot path: doctor opens "my inbox" → list referrals TO me ordered by recency.
CREATE INDEX IF NOT EXISTS "DoctorReferral_toDoctorId_createdAt_idx"
  ON "DoctorReferral"("toDoctorId", "createdAt" DESC);

-- "Referrals I've sent" view for the referrer.
CREATE INDEX IF NOT EXISTS "DoctorReferral_fromDoctorId_createdAt_idx"
  ON "DoctorReferral"("fromDoctorId", "createdAt" DESC);

-- Status filter helper (e.g. count pending across the network).
CREATE INDEX IF NOT EXISTS "DoctorReferral_status_idx"
  ON "DoctorReferral"("status");
