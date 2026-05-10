-- AlterTable
ALTER TABLE "User" ADD COLUMN "hospitalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_hospitalId_key" ON "User"("hospitalId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE;
