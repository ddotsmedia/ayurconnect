-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "availableDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "availableForOnline" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "consultationFee" INTEGER,
ADD COLUMN     "experienceYears" INTEGER,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "qualification" TEXT;

-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "establishedYear" INTEGER,
ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "HealthTip" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "dosha" TEXT NOT NULL,
    "season" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthTip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthTip_dosha_idx" ON "HealthTip"("dosha");

-- CreateIndex
CREATE INDEX "HealthTip_season_idx" ON "HealthTip"("season");
