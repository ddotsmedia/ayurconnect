-- ─── Longitudinal outcome tracking (Feature 3 of 8) ──────────────────────
-- Adds TreatmentEpisode + OutcomeLog tables. Per-episode consent flag
-- gates contribution to k-anonymized aggregates on /research.

CREATE TABLE "TreatmentEpisode" (
    "id" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "doctorUserId" TEXT,
    "condition" TEXT NOT NULL,
    "conditionSlug" TEXT,
    "protocolNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "consentForResearch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentEpisode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TreatmentEpisode_patientUserId_status_idx" ON "TreatmentEpisode"("patientUserId", "status");
CREATE INDEX "TreatmentEpisode_doctorUserId_status_idx"  ON "TreatmentEpisode"("doctorUserId",  "status");
CREATE INDEX "TreatmentEpisode_condition_status_idx"     ON "TreatmentEpisode"("condition",     "status");
CREATE INDEX "TreatmentEpisode_consentForResearch_status_idx" ON "TreatmentEpisode"("consentForResearch", "status");

ALTER TABLE "TreatmentEpisode" ADD CONSTRAINT "TreatmentEpisode_patientUserId_fkey"
  FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE "TreatmentEpisode" ADD CONSTRAINT "TreatmentEpisode_doctorUserId_fkey"
  FOREIGN KEY ("doctorUserId")  REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "OutcomeLog" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "severity" INTEGER NOT NULL,
    "energy" INTEGER,
    "sleepQuality" INTEGER,
    "mood" INTEGER,
    "note" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutcomeLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OutcomeLog_episodeId_date_key" ON "OutcomeLog"("episodeId", "date");
CREATE INDEX "OutcomeLog_episodeId_date_idx"        ON "OutcomeLog"("episodeId", "date");

ALTER TABLE "OutcomeLog" ADD CONSTRAINT "OutcomeLog_episodeId_fkey"
  FOREIGN KEY ("episodeId") REFERENCES "TreatmentEpisode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
