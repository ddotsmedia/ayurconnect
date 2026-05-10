-- CreateTable
CREATE TABLE "JournalEntry" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "date"       DATE NOT NULL,
    "mood"       INTEGER,
    "sleepHours" DOUBLE PRECISION,
    "energy"     INTEGER,
    "symptoms"   TEXT[] DEFAULT ARRAY[]::TEXT[],
    "doshaFeel"  TEXT,
    "food"       TEXT,
    "notes"      TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (unique per user-date)
CREATE UNIQUE INDEX "JournalEntry_userId_date_key" ON "JournalEntry"("userId", "date");
CREATE INDEX        "JournalEntry_userId_date_idx" ON "JournalEntry"("userId", "date");

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
