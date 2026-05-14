-- Phase 7 — Health platform: family profiles, vitals, prescriptions, RPM rules
-- All tables created with IF NOT EXISTS so the migration is safe to re-run
-- against partially-applied environments.

-- ─── FamilyMember ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "FamilyMember" (
  "id"          TEXT PRIMARY KEY,
  "userId"      TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "relation"    TEXT NOT NULL,
  "dob"         DATE,
  "gender"      TEXT,
  "prakriti"    TEXT,
  "conditions"  TEXT[] NOT NULL DEFAULT '{}',
  "notes"       TEXT,
  "avatarColor" TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FamilyMember_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "FamilyMember_userId_createdAt_idx" ON "FamilyMember"("userId", "createdAt");

-- ─── HealthMetric ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "HealthMetric" (
  "id"             TEXT PRIMARY KEY,
  "userId"         TEXT NOT NULL,
  "familyMemberId" TEXT,
  "kind"           TEXT NOT NULL,
  "value"          DOUBLE PRECISION NOT NULL,
  "unit"           TEXT,
  "recordedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "source"         TEXT NOT NULL DEFAULT 'manual',
  "notes"          TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HealthMetric_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HealthMetric_familyMemberId_fkey"
    FOREIGN KEY ("familyMemberId") REFERENCES "FamilyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "HealthMetric_userId_kind_recordedAt_idx"         ON "HealthMetric"("userId", "kind", "recordedAt");
CREATE INDEX IF NOT EXISTS "HealthMetric_userId_recordedAt_idx"              ON "HealthMetric"("userId", "recordedAt");
CREATE INDEX IF NOT EXISTS "HealthMetric_familyMemberId_kind_recordedAt_idx" ON "HealthMetric"("familyMemberId", "kind", "recordedAt");

-- ─── Prescription + PrescriptionItem ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Prescription" (
  "id"                 TEXT PRIMARY KEY,
  "patientId"          TEXT NOT NULL,
  "doctorId"           TEXT NOT NULL,
  "appointmentId"      TEXT,
  "issuedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validUntil"         TIMESTAMP(3),
  "diagnosis"          TEXT,
  "advice"             TEXT,
  "followUpAfterWeeks" INTEGER,
  "status"             TEXT NOT NULL DEFAULT 'active',
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Prescription_doctorId_fkey"  FOREIGN KEY ("doctorId")  REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "Prescription_patientId_issuedAt_idx" ON "Prescription"("patientId", "issuedAt");
CREATE INDEX IF NOT EXISTS "Prescription_doctorId_issuedAt_idx"  ON "Prescription"("doctorId",  "issuedAt");
CREATE INDEX IF NOT EXISTS "Prescription_appointmentId_idx"      ON "Prescription"("appointmentId");

CREATE TABLE IF NOT EXISTS "PrescriptionItem" (
  "id"             TEXT PRIMARY KEY,
  "prescriptionId" TEXT NOT NULL,
  "medication"     TEXT NOT NULL,
  "herbId"         TEXT,
  "dose"           TEXT NOT NULL,
  "frequency"      TEXT NOT NULL,
  "duration"       TEXT,
  "anupana"        TEXT,
  "instructions"   TEXT,
  "position"       INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "PrescriptionItem_prescriptionId_fkey"
    FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "PrescriptionItem_prescriptionId_position_idx" ON "PrescriptionItem"("prescriptionId", "position");

-- ─── RpmAlertRule + RpmAlert ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "RpmAlertRule" (
  "id"               TEXT PRIMARY KEY,
  "patientId"        TEXT NOT NULL,
  "doctorId"         TEXT NOT NULL,
  "kind"             TEXT NOT NULL,
  "operator"         TEXT NOT NULL,
  "threshold"        DOUBLE PRECISION NOT NULL,
  "threshold2"       DOUBLE PRECISION,
  "windowDays"       INTEGER NOT NULL DEFAULT 1,
  "consecutiveCount" INTEGER NOT NULL DEFAULT 1,
  "active"           BOOLEAN NOT NULL DEFAULT TRUE,
  "label"            TEXT,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RpmAlertRule_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "RpmAlertRule_doctorId_fkey"  FOREIGN KEY ("doctorId")  REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "RpmAlertRule_patientId_active_idx" ON "RpmAlertRule"("patientId", "active");
CREATE INDEX IF NOT EXISTS "RpmAlertRule_doctorId_active_idx"  ON "RpmAlertRule"("doctorId",  "active");

CREATE TABLE IF NOT EXISTS "RpmAlert" (
  "id"             TEXT PRIMARY KEY,
  "ruleId"         TEXT NOT NULL,
  "patientId"      TEXT NOT NULL,
  "kind"           TEXT NOT NULL,
  "value"          DOUBLE PRECISION NOT NULL,
  "acknowledged"   BOOLEAN NOT NULL DEFAULT FALSE,
  "acknowledgedAt" TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RpmAlert_ruleId_fkey"    FOREIGN KEY ("ruleId")    REFERENCES "RpmAlertRule"("id") ON DELETE CASCADE,
  CONSTRAINT "RpmAlert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id")         ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "RpmAlert_patientId_acknowledged_createdAt_idx" ON "RpmAlert"("patientId", "acknowledged", "createdAt");
CREATE INDEX IF NOT EXISTS "RpmAlert_ruleId_createdAt_idx"                 ON "RpmAlert"("ruleId",    "createdAt");
