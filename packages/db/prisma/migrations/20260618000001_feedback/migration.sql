CREATE TABLE IF NOT EXISTS "Feedback" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "email"       TEXT,
    "phone"       TEXT,
    "category"    TEXT NOT NULL DEFAULT 'feedback',
    "subject"     TEXT NOT NULL,
    "message"     TEXT NOT NULL,
    "page"        TEXT,
    "status"      TEXT NOT NULL DEFAULT 'new',
    "adminNotes"  TEXT,
    "userId"      TEXT,
    "isRead"      BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Feedback_status_createdAt_idx" ON "Feedback"("status","createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Feedback_category_idx"         ON "Feedback"("category");
CREATE INDEX IF NOT EXISTS "Feedback_isRead_idx"           ON "Feedback"("isRead");
DO $$ BEGIN
  ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
