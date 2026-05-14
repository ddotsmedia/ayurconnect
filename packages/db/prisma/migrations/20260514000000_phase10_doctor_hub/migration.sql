-- Phase 10 — Doctor Knowledge Hub (2026-05-14)
-- 16 new tables; all gated to DOCTOR / DOCTOR_PENDING / ADMIN at the API layer.

-- ─── ClinicalCase + comments + upvotes ──────────────────────────────────
CREATE TABLE IF NOT EXISTS "ClinicalCase" (
  "id"                 TEXT PRIMARY KEY,
  "authorId"           TEXT NOT NULL,
  "title"              TEXT NOT NULL,
  "chiefComplaint"     TEXT NOT NULL,
  "presentingHistory"  TEXT NOT NULL,
  "prakriti"           TEXT,
  "vikriti"            TEXT,
  "ashtavidhaJson"     JSONB,
  "ayurvedicDiagnosis" TEXT NOT NULL,
  "modernDiagnosis"    TEXT,
  "protocolJson"       JSONB NOT NULL,
  "outcomeAtFollowUp"  TEXT,
  "outcomeDetail"      TEXT,
  "durationMonths"     INTEGER,
  "doctorNotes"        TEXT,
  "specialty"          TEXT NOT NULL,
  "condition"          TEXT NOT NULL,
  "tags"               TEXT[] NOT NULL DEFAULT '{}',
  "citations"          JSONB,
  "status"             TEXT NOT NULL DEFAULT 'draft',
  "rejectionReason"    TEXT,
  "publishedAt"        TIMESTAMP(3),
  "viewCount"          INTEGER NOT NULL DEFAULT 0,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicalCase_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "ClinicalCase_status_publishedAt_idx" ON "ClinicalCase"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "ClinicalCase_specialty_status_idx"   ON "ClinicalCase"("specialty", "status");
CREATE INDEX IF NOT EXISTS "ClinicalCase_authorId_createdAt_idx" ON "ClinicalCase"("authorId", "createdAt");

CREATE TABLE IF NOT EXISTS "CaseComment" (
  "id"        TEXT PRIMARY KEY,
  "caseId"    TEXT NOT NULL,
  "authorId"  TEXT NOT NULL,
  "body"      TEXT NOT NULL,
  "citations" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CaseComment_caseId_fkey"   FOREIGN KEY ("caseId")   REFERENCES "ClinicalCase"("id") ON DELETE CASCADE,
  CONSTRAINT "CaseComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id")         ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "CaseComment_caseId_createdAt_idx" ON "CaseComment"("caseId", "createdAt");
CREATE INDEX IF NOT EXISTS "CaseComment_authorId_idx"         ON "CaseComment"("authorId");

CREATE TABLE IF NOT EXISTS "CaseUpvote" (
  "id"        TEXT PRIMARY KEY,
  "caseId"    TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CaseUpvote_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ClinicalCase"("id") ON DELETE CASCADE,
  CONSTRAINT "CaseUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")         ON DELETE CASCADE,
  CONSTRAINT "CaseUpvote_caseId_userId_key" UNIQUE ("caseId", "userId")
);
CREATE INDEX IF NOT EXISTS "CaseUpvote_caseId_idx" ON "CaseUpvote"("caseId");

-- ─── ResearchPaper + bookmark + annotation ──────────────────────────────
CREATE TABLE IF NOT EXISTS "ResearchPaper" (
  "id"          TEXT PRIMARY KEY,
  "title"       TEXT NOT NULL,
  "authors"     TEXT[] NOT NULL DEFAULT '{}',
  "journal"     TEXT NOT NULL,
  "year"        INTEGER NOT NULL,
  "doi"         TEXT UNIQUE,
  "pubmedId"    TEXT UNIQUE,
  "abstract"    TEXT NOT NULL,
  "conditions"  TEXT[] NOT NULL DEFAULT '{}',
  "doshas"      TEXT[] NOT NULL DEFAULT '{}',
  "studyType"   TEXT,
  "sampleSize"  INTEGER,
  "url"         TEXT,
  "pdfUrl"      TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "ResearchPaper_year_idx"             ON "ResearchPaper"("year");
CREATE INDEX IF NOT EXISTS "ResearchPaper_studyType_year_idx"   ON "ResearchPaper"("studyType", "year");

CREATE TABLE IF NOT EXISTS "ResearchPaperBookmark" (
  "id"        TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "paperId"   TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ResearchPaperBookmark_userId_fkey"  FOREIGN KEY ("userId")  REFERENCES "User"("id")          ON DELETE CASCADE,
  CONSTRAINT "ResearchPaperBookmark_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "ResearchPaper"("id") ON DELETE CASCADE,
  CONSTRAINT "ResearchPaperBookmark_userId_paperId_key" UNIQUE ("userId", "paperId")
);
CREATE INDEX IF NOT EXISTS "ResearchPaperBookmark_userId_createdAt_idx" ON "ResearchPaperBookmark"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "ResearchPaperAnnotation" (
  "id"        TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "paperId"   TEXT NOT NULL,
  "body"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ResearchPaperAnnotation_userId_fkey"  FOREIGN KEY ("userId")  REFERENCES "User"("id")          ON DELETE CASCADE,
  CONSTRAINT "ResearchPaperAnnotation_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "ResearchPaper"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "ResearchPaperAnnotation_userId_paperId_idx" ON "ResearchPaperAnnotation"("userId", "paperId");

-- ─── Webinar + registration ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Webinar" (
  "id"            TEXT PRIMARY KEY,
  "slug"          TEXT UNIQUE NOT NULL,
  "title"         TEXT NOT NULL,
  "description"   TEXT NOT NULL,
  "speakerName"   TEXT NOT NULL,
  "speakerUserId" TEXT,
  "scheduledFor"  TIMESTAMP(3) NOT NULL,
  "durationMin"   INTEGER NOT NULL DEFAULT 60,
  "cmeCredits"    DOUBLE PRECISION NOT NULL DEFAULT 1,
  "status"        TEXT NOT NULL DEFAULT 'upcoming',
  "videoRoomUrl"  TEXT,
  "recordingUrl"  TEXT,
  "thumbnailUrl"  TEXT,
  "slidesUrl"     TEXT,
  "resources"     JSONB,
  "specialty"     TEXT,
  "topics"        TEXT[] NOT NULL DEFAULT '{}',
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Webinar_speakerUserId_fkey" FOREIGN KEY ("speakerUserId") REFERENCES "User"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "Webinar_status_scheduledFor_idx" ON "Webinar"("status", "scheduledFor");
CREATE INDEX IF NOT EXISTS "Webinar_scheduledFor_idx"        ON "Webinar"("scheduledFor");

CREATE TABLE IF NOT EXISTS "WebinarRegistration" (
  "id"                  TEXT PRIMARY KEY,
  "userId"              TEXT NOT NULL,
  "webinarId"           TEXT NOT NULL,
  "registeredAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "attended"            BOOLEAN NOT NULL DEFAULT FALSE,
  "attendedAt"          TIMESTAMP(3),
  "certificateIssuedAt" TIMESTAMP(3),
  "certificateId"       TEXT UNIQUE,
  CONSTRAINT "WebinarRegistration_userId_fkey"    FOREIGN KEY ("userId")    REFERENCES "User"("id")     ON DELETE CASCADE,
  CONSTRAINT "WebinarRegistration_webinarId_fkey" FOREIGN KEY ("webinarId") REFERENCES "Webinar"("id") ON DELETE CASCADE,
  CONSTRAINT "WebinarRegistration_userId_webinarId_key" UNIQUE ("userId", "webinarId")
);
CREATE INDEX IF NOT EXISTS "WebinarRegistration_webinarId_attended_idx" ON "WebinarRegistration"("webinarId", "attended");

-- ─── Journal + subscription ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Journal" (
  "id"             TEXT PRIMARY KEY,
  "slug"           TEXT UNIQUE NOT NULL,
  "title"          TEXT NOT NULL,
  "shortName"      TEXT,
  "issn"           TEXT,
  "publisher"      TEXT,
  "scope"          TEXT,
  "url"            TEXT,
  "latestIssueUrl" TEXT,
  "latestIssueAt"  TIMESTAMP(3),
  "sampleArticles" JSONB,
  "language"       TEXT NOT NULL DEFAULT 'en',
  "openAccess"     BOOLEAN NOT NULL DEFAULT FALSE,
  "impactFactor"   DOUBLE PRECISION,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "Journal_title_idx" ON "Journal"("title");

CREATE TABLE IF NOT EXISTS "JournalSubscription" (
  "id"        TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "journalId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JournalSubscription_userId_fkey"    FOREIGN KEY ("userId")    REFERENCES "User"("id")    ON DELETE CASCADE,
  CONSTRAINT "JournalSubscription_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE,
  CONSTRAINT "JournalSubscription_userId_journalId_key" UNIQUE ("userId", "journalId")
);
CREATE INDEX IF NOT EXISTS "JournalSubscription_userId_idx" ON "JournalSubscription"("userId");

-- ─── ClinicalProtocol + comments ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ClinicalProtocol" (
  "id"                TEXT PRIMARY KEY,
  "slug"              TEXT UNIQUE NOT NULL,
  "title"             TEXT NOT NULL,
  "condition"         TEXT NOT NULL,
  "doshas"            TEXT[] NOT NULL DEFAULT '{}',
  "summary"           TEXT NOT NULL,
  "rationale"         TEXT NOT NULL,
  "phasesJson"        JSONB NOT NULL,
  "contraindications" TEXT,
  "expectedDuration"  TEXT,
  "expectedOutcome"   TEXT,
  "citations"         JSONB,
  "authorId"          TEXT NOT NULL,
  "status"            TEXT NOT NULL DEFAULT 'draft',
  "reviewerNotes"     TEXT,
  "publishedAt"       TIMESTAMP(3),
  "viewCount"         INTEGER NOT NULL DEFAULT 0,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicalProtocol_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "ClinicalProtocol_status_publishedAt_idx" ON "ClinicalProtocol"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "ClinicalProtocol_condition_status_idx"   ON "ClinicalProtocol"("condition", "status");
CREATE INDEX IF NOT EXISTS "ClinicalProtocol_authorId_idx"           ON "ClinicalProtocol"("authorId");

CREATE TABLE IF NOT EXISTS "ProtocolComment" (
  "id"         TEXT PRIMARY KEY,
  "protocolId" TEXT NOT NULL,
  "authorId"   TEXT NOT NULL,
  "body"       TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProtocolComment_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "ClinicalProtocol"("id") ON DELETE CASCADE,
  CONSTRAINT "ProtocolComment_authorId_fkey"   FOREIGN KEY ("authorId")   REFERENCES "User"("id")             ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "ProtocolComment_protocolId_createdAt_idx" ON "ProtocolComment"("protocolId", "createdAt");
CREATE INDEX IF NOT EXISTS "ProtocolComment_authorId_idx"             ON "ProtocolComment"("authorId");

-- ─── Conference + RSVP ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Conference" (
  "id"               TEXT PRIMARY KEY,
  "slug"             TEXT UNIQUE NOT NULL,
  "title"            TEXT NOT NULL,
  "startDate"        TIMESTAMP(3) NOT NULL,
  "endDate"          TIMESTAMP(3),
  "location"         TEXT NOT NULL,
  "mode"             TEXT NOT NULL DEFAULT 'in-person',
  "organizer"        TEXT NOT NULL,
  "description"      TEXT,
  "registrationUrl"  TEXT,
  "abstractDeadline" TIMESTAMP(3),
  "topics"           TEXT[] NOT NULL DEFAULT '{}',
  "status"           TEXT NOT NULL DEFAULT 'upcoming',
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "Conference_status_startDate_idx" ON "Conference"("status", "startDate");
CREATE INDEX IF NOT EXISTS "Conference_startDate_idx"        ON "Conference"("startDate");

CREATE TABLE IF NOT EXISTS "ConferenceRSVP" (
  "id"           TEXT PRIMARY KEY,
  "userId"       TEXT NOT NULL,
  "conferenceId" TEXT NOT NULL,
  "status"       TEXT NOT NULL DEFAULT 'attending',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConferenceRSVP_userId_fkey"       FOREIGN KEY ("userId")       REFERENCES "User"("id")        ON DELETE CASCADE,
  CONSTRAINT "ConferenceRSVP_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE,
  CONSTRAINT "ConferenceRSVP_userId_conferenceId_key" UNIQUE ("userId", "conferenceId")
);
CREATE INDEX IF NOT EXISTS "ConferenceRSVP_conferenceId_idx" ON "ConferenceRSVP"("conferenceId");

-- ─── CME credit ledger ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "CmeCredit" (
  "id"            TEXT PRIMARY KEY,
  "userId"        TEXT NOT NULL,
  "source"        TEXT NOT NULL,
  "sourceRefId"   TEXT,
  "credits"       DOUBLE PRECISION NOT NULL,
  "description"   TEXT NOT NULL,
  "earnedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "certificateId" TEXT UNIQUE,
  CONSTRAINT "CmeCredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "CmeCredit_userId_earnedAt_idx"     ON "CmeCredit"("userId", "earnedAt");
CREATE INDEX IF NOT EXISTS "CmeCredit_source_sourceRefId_idx"  ON "CmeCredit"("source", "sourceRefId");

-- ─── Drug interactions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "DrugInteraction" (
  "id"              TEXT PRIMARY KEY,
  "componentA"      TEXT NOT NULL,
  "formulationAId"  TEXT,
  "componentB"      TEXT NOT NULL,
  "componentBKind"  TEXT NOT NULL DEFAULT 'allopathic',
  "formulationBId"  TEXT,
  "severity"        TEXT NOT NULL,
  "mechanism"       TEXT,
  "clinicalEffect"  TEXT NOT NULL,
  "recommendation"  TEXT NOT NULL,
  "evidenceLevel"   TEXT,
  "citations"       JSONB,
  "status"          TEXT NOT NULL DEFAULT 'published',
  "contributedById" TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "DrugInteraction_componentA_idx"       ON "DrugInteraction"("componentA");
CREATE INDEX IF NOT EXISTS "DrugInteraction_componentB_idx"       ON "DrugInteraction"("componentB");
CREATE INDEX IF NOT EXISTS "DrugInteraction_severity_status_idx"  ON "DrugInteraction"("severity", "status");
