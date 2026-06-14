-- ─── Viral growth: doctor recruits doctor, nudges, prescription pad, CME log ──

ALTER TABLE "Doctor"
  ADD COLUMN "referralCode"  TEXT,
  ADD COLUMN "profileBadges" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE UNIQUE INDEX "Doctor_referralCode_key" ON "Doctor"("referralCode");

CREATE TABLE "DoctorRecruitInvite" (
    "id"                 TEXT NOT NULL,
    "referrerDoctorId"   TEXT NOT NULL,
    "referralCode"       TEXT NOT NULL,
    "invitedName"        TEXT,
    "invitedEmail"       TEXT,
    "invitedPhone"       TEXT,
    "invitedWhatsApp"    TEXT,
    "status"             TEXT NOT NULL DEFAULT 'invited',
    "registeredDoctorId" TEXT,
    "source"             TEXT,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredAt"       TIMESTAMP(3),
    "verifiedAt"         TIMESTAMP(3),
    CONSTRAINT "DoctorRecruitInvite_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DoctorRecruitInvite_registeredDoctorId_key"     ON "DoctorRecruitInvite"("registeredDoctorId");
CREATE INDEX        "DoctorRecruitInvite_referrerDoctorId_status_idx" ON "DoctorRecruitInvite"("referrerDoctorId","status");
CREATE INDEX        "DoctorRecruitInvite_referralCode_idx"           ON "DoctorRecruitInvite"("referralCode");
ALTER TABLE "DoctorRecruitInvite"
  ADD CONSTRAINT "DoctorRecruitInvite_referrerDoctorId_fkey"
  FOREIGN KEY ("referrerDoctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DoctorRecruitInvite"
  ADD CONSTRAINT "DoctorRecruitInvite_registeredDoctorId_fkey"
  FOREIGN KEY ("registeredDoctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "DoctorNudge" (
    "id"        TEXT NOT NULL,
    "doctorId"  TEXT NOT NULL,
    "nudgeType" TEXT NOT NULL,
    "sentAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clickedAt" TIMESTAMP(3),
    "channel"   TEXT NOT NULL DEFAULT 'dashboard',
    CONSTRAINT "DoctorNudge_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DoctorNudge_doctorId_nudgeType_key" ON "DoctorNudge"("doctorId","nudgeType");
CREATE INDEX        "DoctorNudge_doctorId_sentAt_idx"    ON "DoctorNudge"("doctorId","sentAt");
ALTER TABLE "DoctorNudge"
  ADD CONSTRAINT "DoctorNudge_doctorId_fkey"
  FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "DoctorPrescription" (
    "id"            TEXT NOT NULL,
    "doctorId"      TEXT NOT NULL,
    "patientName"   TEXT NOT NULL,
    "patientAge"    INTEGER,
    "patientGender" TEXT,
    "diagnosis"     TEXT,
    "diagnosisMl"   TEXT,
    "items"         JSONB NOT NULL,
    "pathya"        TEXT,
    "apathya"       TEXT,
    "notes"         TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DoctorPrescription_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DoctorPrescription_doctorId_createdAt_idx" ON "DoctorPrescription"("doctorId","createdAt");
ALTER TABLE "DoctorPrescription"
  ADD CONSTRAINT "DoctorPrescription_doctorId_fkey"
  FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "DoctorCmeLog" (
    "id"             TEXT NOT NULL,
    "doctorId"       TEXT NOT NULL,
    "eventName"      TEXT NOT NULL,
    "organizer"      TEXT,
    "date"           TIMESTAMP(3) NOT NULL,
    "credits"        DOUBLE PRECISION NOT NULL DEFAULT 1,
    "certificateUrl" TEXT,
    "notes"          TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DoctorCmeLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DoctorCmeLog_doctorId_date_idx" ON "DoctorCmeLog"("doctorId","date");
ALTER TABLE "DoctorCmeLog"
  ADD CONSTRAINT "DoctorCmeLog_doctorId_fkey"
  FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
