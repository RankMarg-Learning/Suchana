/*
  Warnings:

  - The `totalVacancies` column on the `Exam` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isConfirmed` on the `LifecycleEvent` table. All the data in the column will be lost.
  - You are about to drop the `AdminAuditLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[deduplicationKey]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.
  - Made the column `stage` on table `LifecycleEvent` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "LifecycleEvent_examId_idx";

-- DropIndex
DROP INDEX "LifecycleEvent_stage_idx";

-- DropIndex
DROP INDEX "LifecycleEvent_startsAt_idx";

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "deduplicationKey" TEXT,
ADD COLUMN     "sourceStagedExamId" TEXT,
DROP COLUMN "totalVacancies",
ADD COLUMN     "totalVacancies" JSONB;

-- AlterTable
ALTER TABLE "LifecycleEvent" DROP COLUMN "isConfirmed",
ADD COLUMN     "isImportant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceStagedEventId" TEXT,
ADD COLUMN     "stageOrder" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "stage" SET NOT NULL;

-- DropTable
DROP TABLE "AdminAuditLog";

-- CreateTable
CREATE TABLE "ScrapeSource" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'LISTING',
    "hintCategory" TEXT,
    "selectorHints" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeJob" (
    "id" TEXT NOT NULL,
    "scrapeSourceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "candidatesFound" INTEGER NOT NULL DEFAULT 0,
    "rawPayload" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ScrapeJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StagedExam" (
    "id" TEXT NOT NULL,
    "scrapeJobId" TEXT NOT NULL,
    "existingExamId" TEXT,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT,
    "slug" TEXT,
    "description" TEXT,
    "conductingBody" TEXT,
    "category" TEXT,
    "examLevel" TEXT,
    "state" TEXT,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "qualificationCriteria" JSONB,
    "totalVacancies" INTEGER,
    "applicationFee" JSONB,
    "officialWebsite" TEXT,
    "notificationUrl" TEXT,
    "aiConfidence" DOUBLE PRECISION,
    "aiNotes" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "deduplicationKey" TEXT,
    "contentHash" TEXT,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicateOfStagedId" TEXT,
    "mergedSourceUrls" TEXT[],
    "sourceCount" INTEGER NOT NULL DEFAULT 1,
    "sourceUrl" TEXT,
    "scrapedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StagedExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StagedLifecycleEvent" (
    "id" TEXT NOT NULL,
    "stagedExamId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "stageOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isTBD" BOOLEAN NOT NULL DEFAULT false,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StagedLifecycleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeSource_url_key" ON "ScrapeSource"("url");

-- CreateIndex
CREATE INDEX "ScrapeSource_isActive_idx" ON "ScrapeSource"("isActive");

-- CreateIndex
CREATE INDEX "ScrapeSource_sourceType_idx" ON "ScrapeSource"("sourceType");

-- CreateIndex
CREATE INDEX "ScrapeJob_scrapeSourceId_idx" ON "ScrapeJob"("scrapeSourceId");

-- CreateIndex
CREATE INDEX "ScrapeJob_status_idx" ON "ScrapeJob"("status");

-- CreateIndex
CREATE INDEX "ScrapeJob_startedAt_idx" ON "ScrapeJob"("startedAt");

-- CreateIndex
CREATE INDEX "StagedExam_scrapeJobId_idx" ON "StagedExam"("scrapeJobId");

-- CreateIndex
CREATE INDEX "StagedExam_reviewStatus_idx" ON "StagedExam"("reviewStatus");

-- CreateIndex
CREATE INDEX "StagedExam_existingExamId_idx" ON "StagedExam"("existingExamId");

-- CreateIndex
CREATE INDEX "StagedExam_category_reviewStatus_idx" ON "StagedExam"("category", "reviewStatus");

-- CreateIndex
CREATE INDEX "StagedExam_createdAt_idx" ON "StagedExam"("createdAt");

-- CreateIndex
CREATE INDEX "StagedExam_deduplicationKey_idx" ON "StagedExam"("deduplicationKey");

-- CreateIndex
CREATE INDEX "StagedExam_contentHash_idx" ON "StagedExam"("contentHash");

-- CreateIndex
CREATE INDEX "StagedExam_isDuplicate_reviewStatus_idx" ON "StagedExam"("isDuplicate", "reviewStatus");

-- CreateIndex
CREATE INDEX "StagedLifecycleEvent_stagedExamId_idx" ON "StagedLifecycleEvent"("stagedExamId");

-- CreateIndex
CREATE INDEX "StagedLifecycleEvent_stage_idx" ON "StagedLifecycleEvent"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_deduplicationKey_key" ON "Exam"("deduplicationKey");

-- CreateIndex
CREATE INDEX "Exam_state_idx" ON "Exam"("state");

-- CreateIndex
CREATE INDEX "LifecycleEvent_examId_stageOrder_idx" ON "LifecycleEvent"("examId", "stageOrder");

-- CreateIndex
CREATE INDEX "LifecycleEvent_examId_isImportant_idx" ON "LifecycleEvent"("examId", "isImportant");

-- AddForeignKey
ALTER TABLE "ScrapeJob" ADD CONSTRAINT "ScrapeJob_scrapeSourceId_fkey" FOREIGN KEY ("scrapeSourceId") REFERENCES "ScrapeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StagedExam" ADD CONSTRAINT "StagedExam_scrapeJobId_fkey" FOREIGN KEY ("scrapeJobId") REFERENCES "ScrapeJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StagedLifecycleEvent" ADD CONSTRAINT "StagedLifecycleEvent_stagedExamId_fkey" FOREIGN KEY ("stagedExamId") REFERENCES "StagedExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
