-- CRM pipeline upgrade on Lead, Prakriti quiz results, Diet Engine cache.
-- 2026-05-11.

-- Lead: pipeline columns
ALTER TABLE "Lead"
  ADD COLUMN "stage"        TEXT      NOT NULL DEFAULT 'new',
  ADD COLUMN "assignedToId" TEXT,
  ADD COLUMN "followUpAt"   TIMESTAMP(3),
  ADD COLUMN "notesJson"    JSONB;

UPDATE "Lead" SET "stage" = CASE
  WHEN "status" = 'new'       THEN 'new'
  WHEN "status" = 'contacted' THEN 'contacted'
  WHEN "status" = 'closed'    THEN 'won'
  WHEN "status" = 'spam'      THEN 'spam'
  ELSE 'new'
END;

ALTER TABLE "Lead"
  ADD CONSTRAINT "Lead_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Lead_stage_createdAt_idx"  ON "Lead" ("stage", "createdAt");
CREATE INDEX "Lead_assignedToId_idx"     ON "Lead" ("assignedToId");
CREATE INDEX "Lead_followUpAt_idx"       ON "Lead" ("followUpAt");

-- PrakritiAssessment
CREATE TABLE "PrakritiAssessment" (
  "id"        TEXT      NOT NULL,
  "userId"    TEXT,
  "sessionId" TEXT,
  "vata"      INTEGER   NOT NULL,
  "pitta"     INTEGER   NOT NULL,
  "kapha"     INTEGER   NOT NULL,
  "dominant"  TEXT      NOT NULL,
  "responses" JSONB     NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PrakritiAssessment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PrakritiAssessment_userId_createdAt_idx" ON "PrakritiAssessment" ("userId", "createdAt");
CREATE INDEX "PrakritiAssessment_dominant_idx"          ON "PrakritiAssessment" ("dominant");
CREATE INDEX "PrakritiAssessment_createdAt_idx"         ON "PrakritiAssessment" ("createdAt");

-- DietPlan
CREATE TABLE "DietPlan" (
  "id"          TEXT      NOT NULL,
  "userId"      TEXT,
  "dosha"       TEXT      NOT NULL,
  "season"      TEXT,
  "conditions"  TEXT[]    NOT NULL DEFAULT ARRAY[]::TEXT[],
  "preferences" JSONB,
  "output"      JSONB     NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "DietPlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DietPlan_userId_createdAt_idx" ON "DietPlan" ("userId", "createdAt");
CREATE INDEX "DietPlan_dosha_season_idx"     ON "DietPlan" ("dosha", "season");
CREATE INDEX "DietPlan_createdAt_idx"        ON "DietPlan" ("createdAt");
