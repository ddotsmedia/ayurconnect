-- ─── BAMS Learning section — additive only ────────────────────────────

CREATE TABLE IF NOT EXISTS "BamsSubject" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "nameMl"      TEXT,
    "slug"        TEXT NOT NULL,
    "year"        TEXT NOT NULL,
    "semester"    INTEGER,
    "description" TEXT,
    "sortOrder"   INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BamsSubject_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "BamsSubject_slug_key" ON "BamsSubject"("slug");
CREATE INDEX IF NOT EXISTS "BamsSubject_year_idx"        ON "BamsSubject"("year");

CREATE TABLE IF NOT EXISTS "StudyNote" (
    "id"               TEXT NOT NULL,
    "title"            TEXT NOT NULL,
    "titleMl"          TEXT,
    "slug"             TEXT NOT NULL,
    "subjectId"        TEXT,
    "year"             TEXT NOT NULL,
    "topic"            TEXT,
    "topicMl"          TEXT,
    "content"          TEXT NOT NULL,
    "contentMl"        TEXT,
    "summary"          TEXT,
    "keyPoints"        TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "references"       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "tags"             TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "difficulty"       TEXT NOT NULL DEFAULT 'beginner',
    "readTimeMinutes"  INTEGER NOT NULL DEFAULT 5,
    "viewCount"        INTEGER NOT NULL DEFAULT 0,
    "likeCount"        INTEGER NOT NULL DEFAULT 0,
    "bookmarkCount"    INTEGER NOT NULL DEFAULT 0,
    "authorName"       TEXT NOT NULL DEFAULT 'AyurConnect Academic',
    "isPublished"      BOOLEAN NOT NULL DEFAULT true,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudyNote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "StudyNote_slug_key" ON "StudyNote"("slug");
CREATE INDEX IF NOT EXISTS "StudyNote_year_subjectId_idx" ON "StudyNote"("year", "subjectId");

CREATE TABLE IF NOT EXISTS "QuestionPaper" (
    "id"              TEXT NOT NULL,
    "title"           TEXT NOT NULL,
    "slug"            TEXT NOT NULL,
    "subjectId"       TEXT,
    "year"            TEXT NOT NULL,
    "university"      TEXT,
    "examYear"        INTEGER,
    "examMonth"       TEXT,
    "paperType"       TEXT NOT NULL DEFAULT 'regular',
    "isSolved"        BOOLEAN NOT NULL DEFAULT false,
    "questionContent" TEXT NOT NULL,
    "solutionContent" TEXT,
    "pdfUrl"          TEXT,
    "viewCount"       INTEGER NOT NULL DEFAULT 0,
    "downloadCount"   INTEGER NOT NULL DEFAULT 0,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,
    CONSTRAINT "QuestionPaper_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "QuestionPaper_slug_key" ON "QuestionPaper"("slug");
CREATE INDEX IF NOT EXISTS "QuestionPaper_year_subjectId_idx" ON "QuestionPaper"("year", "subjectId");

CREATE TABLE IF NOT EXISTS "McqQuestion" (
    "id"             TEXT NOT NULL,
    "subjectId"      TEXT,
    "topic"          TEXT,
    "question"       TEXT NOT NULL,
    "questionMl"     TEXT,
    "optionA"        TEXT NOT NULL,
    "optionB"        TEXT NOT NULL,
    "optionC"        TEXT NOT NULL,
    "optionD"        TEXT NOT NULL,
    "correctAnswer"  TEXT NOT NULL,
    "explanation"    TEXT,
    "explanationMl"  TEXT,
    "difficulty"     TEXT NOT NULL DEFAULT 'medium',
    "examRelevance"  TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "reference"      TEXT,
    "yearAsked"      INTEGER,
    "viewCount"      INTEGER NOT NULL DEFAULT 0,
    "isPublished"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "McqQuestion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "McqQuestion_subjectId_difficulty_idx" ON "McqQuestion"("subjectId", "difficulty");

CREATE TABLE IF NOT EXISTS "McqAttempt" (
    "id"             TEXT NOT NULL,
    "userId"         TEXT NOT NULL,
    "questionId"     TEXT NOT NULL,
    "selectedAnswer" TEXT NOT NULL,
    "isCorrect"      BOOLEAN NOT NULL,
    "attemptedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "McqAttempt_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "McqAttempt_userId_attemptedAt_idx" ON "McqAttempt"("userId", "attemptedAt");
DO $$ BEGIN
  ALTER TABLE "McqAttempt" ADD CONSTRAINT "McqAttempt_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "BamsCaseStudy" (
    "id"                  TEXT NOT NULL,
    "title"               TEXT NOT NULL,
    "titleMl"             TEXT,
    "slug"                TEXT NOT NULL,
    "specialization"      TEXT,
    "patientAge"          INTEGER,
    "patientGender"       TEXT,
    "chiefComplaint"      TEXT NOT NULL,
    "chiefComplaintMl"    TEXT,
    "history"             TEXT,
    "examination"         TEXT,
    "ayurvedicAssessment" TEXT,
    "diagnosis"           TEXT,
    "treatmentPlan"       TEXT,
    "outcome"             TEXT,
    "discussion"          TEXT,
    "references"          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "difficulty"          TEXT NOT NULL DEFAULT 'beginner',
    "tags"                TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "viewCount"           INTEGER NOT NULL DEFAULT 0,
    "likeCount"           INTEGER NOT NULL DEFAULT 0,
    "authorName"          TEXT NOT NULL DEFAULT 'AyurConnect Academic',
    "isPublished"         BOOLEAN NOT NULL DEFAULT true,
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"           TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BamsCaseStudy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "BamsCaseStudy_slug_key" ON "BamsCaseStudy"("slug");

CREATE TABLE IF NOT EXISTS "BamsWorkshop" (
    "id"               TEXT NOT NULL,
    "title"            TEXT NOT NULL,
    "titleMl"          TEXT,
    "slug"             TEXT NOT NULL,
    "description"      TEXT,
    "descriptionMl"    TEXT,
    "instructor"       TEXT,
    "instructorBio"    TEXT,
    "instructorImage"  TEXT,
    "topic"            TEXT,
    "specialization"   TEXT,
    "type"             TEXT NOT NULL DEFAULT 'recorded',
    "platform"         TEXT,
    "date"             TIMESTAMP(3),
    "duration"         INTEGER,
    "maxParticipants"  INTEGER,
    "registeredCount"  INTEGER NOT NULL DEFAULT 0,
    "meetingLink"      TEXT,
    "recordingUrl"     TEXT,
    "thumbnailUrl"     TEXT,
    "isFree"           BOOLEAN NOT NULL DEFAULT true,
    "price"            INTEGER NOT NULL DEFAULT 0,
    "currency"         TEXT NOT NULL DEFAULT 'INR',
    "tags"             TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status"           TEXT NOT NULL DEFAULT 'completed',
    "viewCount"        INTEGER NOT NULL DEFAULT 0,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BamsWorkshop_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "BamsWorkshop_slug_key" ON "BamsWorkshop"("slug");

CREATE TABLE IF NOT EXISTS "WorkshopRegistration" (
    "id"            TEXT NOT NULL,
    "workshopId"    TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "registeredAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendedAt"    TIMESTAMP(3),
    CONSTRAINT "WorkshopRegistration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "WorkshopRegistration_workshopId_userId_key" ON "WorkshopRegistration"("workshopId","userId");
DO $$ BEGIN
  ALTER TABLE "WorkshopRegistration" ADD CONSTRAINT "WorkshopRegistration_workshopId_fkey"
    FOREIGN KEY ("workshopId") REFERENCES "BamsWorkshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "WorkshopRegistration" ADD CONSTRAINT "WorkshopRegistration_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "Ebook" (
    "id"             TEXT NOT NULL,
    "title"          TEXT NOT NULL,
    "titleMl"        TEXT,
    "slug"           TEXT NOT NULL,
    "author"         TEXT,
    "authorMl"       TEXT,
    "description"    TEXT,
    "descriptionMl"  TEXT,
    "subject"        TEXT,
    "category"       TEXT NOT NULL DEFAULT 'textbook',
    "language"       TEXT NOT NULL DEFAULT 'en',
    "pages"          INTEGER,
    "fileUrl"        TEXT,
    "coverImageUrl"  TEXT,
    "fileSize"       TEXT,
    "format"         TEXT NOT NULL DEFAULT 'pdf',
    "isFree"         BOOLEAN NOT NULL DEFAULT true,
    "price"          INTEGER NOT NULL DEFAULT 0,
    "downloadCount"  INTEGER NOT NULL DEFAULT 0,
    "viewCount"      INTEGER NOT NULL DEFAULT 0,
    "tags"           TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "isPublished"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Ebook_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Ebook_slug_key" ON "Ebook"("slug");

CREATE TABLE IF NOT EXISTS "LearnBookmark" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "entityType"  TEXT NOT NULL,
    "entityId"    TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LearnBookmark_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "LearnBookmark_userId_entityType_entityId_key" ON "LearnBookmark"("userId","entityType","entityId");
DO $$ BEGIN
  ALTER TABLE "LearnBookmark" ADD CONSTRAINT "LearnBookmark_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
