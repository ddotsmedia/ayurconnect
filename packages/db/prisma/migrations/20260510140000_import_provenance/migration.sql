-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "importedAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "tcmcNumber" TEXT;

-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "classification" TEXT,
ADD COLUMN     "importedAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_tcmcNumber_key" ON "Doctor"("tcmcNumber");
