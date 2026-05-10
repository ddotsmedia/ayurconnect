
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "chiefComplaint" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "fee" INTEGER,
ADD COLUMN     "paymentProvider" TEXT,
ADD COLUMN     "paymentRef" TEXT,
ADD COLUMN     "paymentStatus" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "doctorId" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "prakriti" TEXT;

-- CreateTable
CREATE TABLE "Upvote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upvote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedDoctor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedDoctor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Upvote_postId_idx" ON "Upvote"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Upvote_userId_postId_key" ON "Upvote"("userId", "postId");

-- CreateIndex
CREATE INDEX "SavedDoctor_userId_idx" ON "SavedDoctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedDoctor_userId_doctorId_key" ON "SavedDoctor"("userId", "doctorId");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Appointment_dateTime_idx" ON "Appointment"("dateTime");

-- CreateIndex
CREATE UNIQUE INDEX "User_doctorId_key" ON "User"("doctorId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedDoctor" ADD CONSTRAINT "SavedDoctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedDoctor" ADD CONSTRAINT "SavedDoctor_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

