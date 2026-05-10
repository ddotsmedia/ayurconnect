-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT,
    "sessionId" TEXT,
    "name"      TEXT NOT NULL,
    "props"     JSONB,
    "path"      TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AnalyticsEvent_name_createdAt_idx"   ON "AnalyticsEvent"("name", "createdAt");
CREATE INDEX "AnalyticsEvent_userId_createdAt_idx" ON "AnalyticsEvent"("userId", "createdAt");
