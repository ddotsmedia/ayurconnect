-- Phase 8 (2026-05-13) — Public Q&A library, Wellness Programs, Ayurveda Formulary
-- Inspired by iCliniq (Q&A), Ayushakti (programs), NirogStreet (formulary).

-- ─── PublicQuestion + DoctorAnswer ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS "PublicQuestion" (
  "id"          TEXT PRIMARY KEY,
  "userId"      TEXT,
  "authorName"  TEXT,
  "age"         INTEGER,
  "gender"      TEXT,
  "country"     TEXT,
  "title"       TEXT NOT NULL,
  "body"        TEXT NOT NULL,
  "category"    TEXT NOT NULL,
  "language"    TEXT NOT NULL DEFAULT 'en',
  "status"      TEXT NOT NULL DEFAULT 'pending',
  "viewCount"   INTEGER NOT NULL DEFAULT 0,
  "slug"        TEXT UNIQUE,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PublicQuestion_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "PublicQuestion_status_category_createdAt_idx" ON "PublicQuestion"("status", "category", "createdAt");
CREATE INDEX IF NOT EXISTS "PublicQuestion_status_createdAt_idx"          ON "PublicQuestion"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "PublicQuestion_userId_idx"                    ON "PublicQuestion"("userId");

CREATE TABLE IF NOT EXISTS "DoctorAnswer" (
  "id"           TEXT PRIMARY KEY,
  "questionId"   TEXT NOT NULL,
  "doctorUserId" TEXT NOT NULL,
  "body"         TEXT NOT NULL,
  "featured"     BOOLEAN NOT NULL DEFAULT FALSE,
  "helpfulCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DoctorAnswer_questionId_fkey"   FOREIGN KEY ("questionId")   REFERENCES "PublicQuestion"("id") ON DELETE CASCADE,
  CONSTRAINT "DoctorAnswer_doctorUserId_fkey" FOREIGN KEY ("doctorUserId") REFERENCES "User"("id")          ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "DoctorAnswer_questionId_featured_createdAt_idx" ON "DoctorAnswer"("questionId", "featured", "createdAt");
CREATE INDEX IF NOT EXISTS "DoctorAnswer_doctorUserId_createdAt_idx"        ON "DoctorAnswer"("doctorUserId", "createdAt");

-- ─── WellnessProgram + ProgramDay + ProgramEnrollment ────────────────────
CREATE TABLE IF NOT EXISTS "WellnessProgram" (
  "id"           TEXT PRIMARY KEY,
  "slug"         TEXT UNIQUE NOT NULL,
  "name"         TEXT NOT NULL,
  "tagline"      TEXT NOT NULL,
  "description"  TEXT NOT NULL,
  "durationDays" INTEGER NOT NULL,
  "category"     TEXT NOT NULL,
  "dosha"        TEXT,
  "difficulty"   TEXT NOT NULL DEFAULT 'beginner',
  "priceInr"     INTEGER NOT NULL DEFAULT 0,
  "heroEmoji"    TEXT,
  "heroColor"    TEXT,
  "published"    BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "WellnessProgram_category_published_idx" ON "WellnessProgram"("category", "published");
CREATE INDEX IF NOT EXISTS "WellnessProgram_published_createdAt_idx" ON "WellnessProgram"("published", "createdAt");

CREATE TABLE IF NOT EXISTS "ProgramDay" (
  "id"        TEXT PRIMARY KEY,
  "programId" TEXT NOT NULL,
  "dayNumber" INTEGER NOT NULL,
  "title"     TEXT NOT NULL,
  "actions"   JSONB NOT NULL,
  "notes"     TEXT,
  CONSTRAINT "ProgramDay_programId_fkey"
    FOREIGN KEY ("programId") REFERENCES "WellnessProgram"("id") ON DELETE CASCADE,
  CONSTRAINT "ProgramDay_programId_dayNumber_key" UNIQUE ("programId", "dayNumber")
);
CREATE INDEX IF NOT EXISTS "ProgramDay_programId_dayNumber_idx" ON "ProgramDay"("programId", "dayNumber");

CREATE TABLE IF NOT EXISTS "ProgramEnrollment" (
  "id"            TEXT PRIMARY KEY,
  "userId"        TEXT NOT NULL,
  "programId"     TEXT NOT NULL,
  "startedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt"   TIMESTAMP(3),
  "currentDay"    INTEGER NOT NULL DEFAULT 1,
  "completedDays" INTEGER[] NOT NULL DEFAULT '{}',
  "status"        TEXT NOT NULL DEFAULT 'active',
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProgramEnrollment_userId_fkey"    FOREIGN KEY ("userId")    REFERENCES "User"("id")            ON DELETE CASCADE,
  CONSTRAINT "ProgramEnrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "WellnessProgram"("id") ON DELETE CASCADE,
  CONSTRAINT "ProgramEnrollment_userId_programId_key" UNIQUE ("userId", "programId")
);
CREATE INDEX IF NOT EXISTS "ProgramEnrollment_userId_status_idx"    ON "ProgramEnrollment"("userId", "status");
CREATE INDEX IF NOT EXISTS "ProgramEnrollment_programId_status_idx" ON "ProgramEnrollment"("programId", "status");

-- ─── AyurvedaFormulation ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AyurvedaFormulation" (
  "id"              TEXT PRIMARY KEY,
  "slug"            TEXT UNIQUE NOT NULL,
  "name"            TEXT NOT NULL,
  "sanskritName"    TEXT,
  "malayalamName"   TEXT,
  "classicalText"   TEXT,
  "category"        TEXT NOT NULL,
  "ingredients"     TEXT[] NOT NULL DEFAULT '{}',
  "primaryUses"     TEXT[] NOT NULL DEFAULT '{}',
  "doshaImpact"     TEXT,
  "typicalDose"     TEXT,
  "anupanaCommon"   TEXT,
  "contraindications" TEXT,
  "sideEffects"     TEXT,
  "availability"    TEXT,
  "manufacturers"   TEXT[] NOT NULL DEFAULT '{}',
  "description"     TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "AyurvedaFormulation_category_idx" ON "AyurvedaFormulation"("category");
CREATE INDEX IF NOT EXISTS "AyurvedaFormulation_slug_idx"     ON "AyurvedaFormulation"("slug");
