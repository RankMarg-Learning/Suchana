/*
  Warnings:

  - You are about to drop the column `minQualification` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `LifecycleEvent` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "LifecycleEvent_notificationSent_scheduledAt_idx";

-- DropIndex
DROP INDEX "LifecycleEvent_scheduledAt_idx";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "minQualification",
ADD COLUMN     "examLevel" TEXT NOT NULL DEFAULT 'NATIONAL',
ADD COLUMN     "qualificationCriteria" JSONB,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "LifecycleEvent" DROP COLUMN "scheduledAt",
ADD COLUMN     "actionLabel" TEXT,
ADD COLUMN     "isTBD" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stage" TEXT,
ADD COLUMN     "startsAt" TIMESTAMP(3),
ALTER COLUMN "isConfirmed" SET DEFAULT true;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "qualification" TEXT,
    "preferredCategories" TEXT[],
    "preferredExamLevel" TEXT,
    "savedExamIds" TEXT[],
    "employmentStatus" TEXT,
    "languagePreference" TEXT NOT NULL DEFAULT 'HINDI',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "fcmToken" TEXT,
    "platform" TEXT,
    "appVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_state_idx" ON "User"("state");

-- CreateIndex
CREATE INDEX "User_qualification_idx" ON "User"("qualification");

-- CreateIndex
CREATE INDEX "User_employmentStatus_idx" ON "User"("employmentStatus");

-- CreateIndex
CREATE INDEX "Exam_examLevel_idx" ON "Exam"("examLevel");

-- CreateIndex
CREATE INDEX "LifecycleEvent_startsAt_idx" ON "LifecycleEvent"("startsAt");

-- CreateIndex
CREATE INDEX "LifecycleEvent_stage_idx" ON "LifecycleEvent"("stage");

-- CreateIndex
CREATE INDEX "LifecycleEvent_notificationSent_startsAt_idx" ON "LifecycleEvent"("notificationSent", "startsAt");
