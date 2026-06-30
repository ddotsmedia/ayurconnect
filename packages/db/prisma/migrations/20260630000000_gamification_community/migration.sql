-- Gamification + community + demand signals (2026-06-30)
-- Additive: new tables + 1 new nullable column on User.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "weeklyDigestOptIn" BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS "UserStreak" (
  "id"              TEXT      PRIMARY KEY,
  "userId"          TEXT      NOT NULL UNIQUE,
  "currentStreak"   INTEGER   NOT NULL DEFAULT 0,
  "longestStreak"   INTEGER   NOT NULL DEFAULT 0,
  "lastActiveDate"  TIMESTAMP(3),
  "totalPoints"     INTEGER   NOT NULL DEFAULT 0,
  "level"           TEXT      NOT NULL DEFAULT 'beginner',
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "PointLog" (
  "id"          TEXT     PRIMARY KEY,
  "userId"      TEXT     NOT NULL,
  "points"      INTEGER  NOT NULL,
  "action"      TEXT     NOT NULL,
  "description" TEXT,
  "earnedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PointLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "PointLog_userId_earnedAt_idx" ON "PointLog"("userId", "earnedAt" DESC);
CREATE INDEX IF NOT EXISTS "PointLog_earnedAt_idx"        ON "PointLog"("earnedAt");

CREATE TABLE IF NOT EXISTS "Referral" (
  "id"              TEXT      PRIMARY KEY,
  "referrerId"      TEXT      NOT NULL,
  "referredUserId"  TEXT      NOT NULL UNIQUE,
  "status"          TEXT      NOT NULL DEFAULT 'registered',
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Referral_referrerId_fkey"     FOREIGN KEY ("referrerId")     REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Referral_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Referral_referrerId_idx" ON "Referral"("referrerId");

CREATE TABLE IF NOT EXISTS "AnonymousSearchEvent" (
  "id"             TEXT      PRIMARY KEY,
  "query"          TEXT      NOT NULL,
  "specialization" TEXT,
  "district"       TEXT,
  "country"        TEXT,
  "source"         TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AnonymousSearchEvent_district_createdAt_idx" ON "AnonymousSearchEvent"("district", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AnonymousSearchEvent_createdAt_idx"          ON "AnonymousSearchEvent"("createdAt" DESC);

CREATE TABLE IF NOT EXISTS "StudyThread" (
  "id"          TEXT     PRIMARY KEY,
  "userId"      TEXT     NOT NULL,
  "subjectSlug" TEXT,
  "title"       TEXT     NOT NULL,
  "content"     TEXT     NOT NULL,
  "category"    TEXT     NOT NULL DEFAULT 'discussion',
  "upvoteCount" INTEGER  NOT NULL DEFAULT 0,
  "replyCount"  INTEGER  NOT NULL DEFAULT 0,
  "isPinned"    BOOLEAN  NOT NULL DEFAULT FALSE,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudyThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "StudyThread_subjectSlug_createdAt_idx" ON "StudyThread"("subjectSlug", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "StudyThread_createdAt_idx"             ON "StudyThread"("createdAt" DESC);

CREATE TABLE IF NOT EXISTS "StudyReply" (
  "id"          TEXT     PRIMARY KEY,
  "threadId"    TEXT     NOT NULL,
  "userId"      TEXT     NOT NULL,
  "content"     TEXT     NOT NULL,
  "upvoteCount" INTEGER  NOT NULL DEFAULT 0,
  "isAccepted"  BOOLEAN  NOT NULL DEFAULT FALSE,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudyReply_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "StudyThread"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudyReply_userId_fkey"   FOREIGN KEY ("userId")   REFERENCES "User"("id")        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "StudyReply_threadId_createdAt_idx" ON "StudyReply"("threadId", "createdAt");
