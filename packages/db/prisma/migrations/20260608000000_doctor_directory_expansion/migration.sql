-- ─── Kerala-origin + diaspora doctor fields (additive, all nullable) ────

ALTER TABLE "Doctor"
  ADD COLUMN "homeDistrict"             TEXT,
  ADD COLUMN "college"                  TEXT,
  ADD COLUMN "collegeSlug"              TEXT,
  ADD COLUMN "batchYear"                INTEGER,
  ADD COLUMN "ksmcRegNumber"            TEXT,
  ADD COLUMN "lineageOrTradition"       TEXT,
  ADD COLUMN "localRegBody"             TEXT,
  ADD COLUMN "localRegNumber"           TEXT,
  ADD COLUMN "localRegCountry"          TEXT,
  ADD COLUMN "practiceMode"             TEXT DEFAULT 'both',
  ADD COLUMN "specialTreatmentsOffered" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "aboutMl"                  TEXT,
  ADD COLUMN "profileClaimedAt"         TIMESTAMP(3),
  ADD COLUMN "profileCompleteness"      INTEGER DEFAULT 0,
  ADD COLUMN "selfRegistered"           BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "featured"                 BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "degreeCertUrl"            TEXT,
  ADD COLUMN "regCertUrl"               TEXT,
  ADD COLUMN "photoIdUrl"               TEXT;

CREATE INDEX "Doctor_homeDistrict_idx"                ON "Doctor"("homeDistrict");
CREATE INDEX "Doctor_collegeSlug_batchYear_idx"       ON "Doctor"("collegeSlug", "batchYear");
CREATE INDEX "Doctor_selfRegistered_moderationStatus_idx" ON "Doctor"("selfRegistered", "moderationStatus");
CREATE INDEX "Doctor_featured_ccimVerified_idx"       ON "Doctor"("featured", "ccimVerified");
