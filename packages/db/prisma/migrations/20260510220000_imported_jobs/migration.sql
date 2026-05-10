-- CreateTable
CREATE TABLE "ImportedJob" (
    "id"             TEXT NOT NULL,
    "title"          TEXT NOT NULL,
    "organization"   TEXT,
    "location"       TEXT,
    "description"    TEXT,
    "qualifications" TEXT,
    "lastDate"       TIMESTAMP(3),
    "applyUrl"       TEXT NOT NULL,
    "source"         TEXT NOT NULL,
    "sourceId"       TEXT NOT NULL,
    "salary"         TEXT,
    "jobType"        TEXT,
    "category"       TEXT,
    "isAutoImported" BOOLEAN NOT NULL DEFAULT true,
    "isActive"       BOOLEAN NOT NULL DEFAULT true,
    "importedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportedJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (sourceId is unique — dedupe key, MD5 fingerprint)
CREATE UNIQUE INDEX "ImportedJob_sourceId_key"           ON "ImportedJob"("sourceId");
CREATE INDEX        "ImportedJob_source_importedAt_idx"  ON "ImportedJob"("source", "importedAt");
CREATE INDEX        "ImportedJob_isActive_importedAt_idx" ON "ImportedJob"("isActive", "importedAt");
CREATE INDEX        "ImportedJob_category_idx"           ON "ImportedJob"("category");
