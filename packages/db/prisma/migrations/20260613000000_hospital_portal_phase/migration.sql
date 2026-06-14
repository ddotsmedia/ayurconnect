-- ─── Hospital Management Portal — Phase additions ─────────────────────
-- Adds rich profile fields to Hospital, plus four new models:
-- TreatmentPackage, HospitalInquiry, HospitalReviewResponse, HospitalPromotion,
-- HospitalDoctorLink. Additive; all existing rows remain valid.

ALTER TABLE "Hospital"
  ADD COLUMN "slug"           TEXT,
  ADD COLUMN "nameMl"         TEXT,
  ADD COLUMN "pincode"        TEXT,
  ADD COLUMN "tourismClass"   TEXT,
  ADD COLUMN "iso"            TEXT,
  ADD COLUMN "profileMl"      TEXT,
  ADD COLUMN "treatments"     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "facilities"     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "photos"         TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "languages"      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "paymentMethods" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "operatingHours" JSONB,
  ADD COLUMN "whatsapp"       TEXT,
  ADD COLUMN "email"          TEXT;

CREATE UNIQUE INDEX "Hospital_slug_key" ON "Hospital"("slug");

-- TreatmentPackage
CREATE TABLE "TreatmentPackage" (
    "id"            TEXT NOT NULL,
    "hospitalId"    TEXT NOT NULL,
    "name"          TEXT NOT NULL,
    "nameMl"        TEXT,
    "slug"          TEXT NOT NULL,
    "description"   TEXT NOT NULL,
    "descriptionMl" TEXT,
    "treatments"    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "duration"      TEXT NOT NULL,
    "priceFrom"     INTEGER NOT NULL,
    "priceTo"       INTEGER,
    "currency"      TEXT NOT NULL DEFAULT 'INR',
    "includes"      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "idealFor"      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "season"        TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "maxPatients"   INTEGER,
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "isFeatured"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TreatmentPackage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TreatmentPackage_hospitalId_slug_key" ON "TreatmentPackage"("hospitalId","slug");
CREATE INDEX "TreatmentPackage_hospitalId_isActive_idx"    ON "TreatmentPackage"("hospitalId","isActive");
CREATE INDEX "TreatmentPackage_isFeatured_idx"             ON "TreatmentPackage"("isFeatured");
ALTER TABLE "TreatmentPackage"
  ADD CONSTRAINT "TreatmentPackage_hospitalId_fkey"
  FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- HospitalInquiry
CREATE TABLE "HospitalInquiry" (
    "id"                TEXT NOT NULL,
    "hospitalId"        TEXT NOT NULL,
    "patientName"       TEXT NOT NULL,
    "email"             TEXT NOT NULL,
    "phone"             TEXT,
    "whatsapp"          TEXT,
    "country"           TEXT,
    "treatmentInterest" TEXT,
    "preferredDates"    TEXT,
    "message"           TEXT NOT NULL,
    "source"            TEXT NOT NULL DEFAULT 'website',
    "status"            TEXT NOT NULL DEFAULT 'new',
    "notes"             TEXT,
    "assignedTo"        TEXT,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HospitalInquiry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HospitalInquiry_hospitalId_status_createdAt_idx" ON "HospitalInquiry"("hospitalId","status","createdAt");
CREATE INDEX "HospitalInquiry_hospitalId_source_idx"           ON "HospitalInquiry"("hospitalId","source");
ALTER TABLE "HospitalInquiry"
  ADD CONSTRAINT "HospitalInquiry_hospitalId_fkey"
  FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- HospitalReviewResponse
CREATE TABLE "HospitalReviewResponse" (
    "id"         TEXT NOT NULL,
    "reviewId"   TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "body"       TEXT NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HospitalReviewResponse_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HospitalReviewResponse_reviewId_key" ON "HospitalReviewResponse"("reviewId");
CREATE INDEX        "HospitalReviewResponse_hospitalId_idx" ON "HospitalReviewResponse"("hospitalId");
ALTER TABLE "HospitalReviewResponse"
  ADD CONSTRAINT "HospitalReviewResponse_reviewId_fkey"
  FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HospitalReviewResponse"
  ADD CONSTRAINT "HospitalReviewResponse_hospitalId_fkey"
  FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- HospitalPromotion
CREATE TABLE "HospitalPromotion" (
    "id"         TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "title"      TEXT NOT NULL,
    "subtitle"   TEXT,
    "ctaLabel"   TEXT,
    "ctaUrl"     TEXT,
    "startsAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt"     TIMESTAMP(3),
    "isActive"   BOOLEAN NOT NULL DEFAULT true,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HospitalPromotion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HospitalPromotion_hospitalId_isActive_endsAt_idx" ON "HospitalPromotion"("hospitalId","isActive","endsAt");
ALTER TABLE "HospitalPromotion"
  ADD CONSTRAINT "HospitalPromotion_hospitalId_fkey"
  FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- HospitalDoctorLink
CREATE TABLE "HospitalDoctorLink" (
    "id"         TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "doctorId"   TEXT NOT NULL,
    "role"       TEXT,
    "position"   INTEGER NOT NULL DEFAULT 0,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HospitalDoctorLink_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HospitalDoctorLink_hospitalId_doctorId_key" ON "HospitalDoctorLink"("hospitalId","doctorId");
CREATE INDEX        "HospitalDoctorLink_hospitalId_position_idx" ON "HospitalDoctorLink"("hospitalId","position");
ALTER TABLE "HospitalDoctorLink"
  ADD CONSTRAINT "HospitalDoctorLink_hospitalId_fkey"
  FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HospitalDoctorLink"
  ADD CONSTRAINT "HospitalDoctorLink_doctorId_fkey"
  FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
