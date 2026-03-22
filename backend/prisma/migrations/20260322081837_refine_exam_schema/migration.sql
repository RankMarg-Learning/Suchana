/*
  Warnings:

  - You are about to drop the column `maxAge` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `minAge` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `LifecycleEvent` table. All the data in the column will be lost.
  - You are about to drop the column `isImportant` on the `LifecycleEvent` table. All the data in the column will be lost.
  - You are about to drop the column `maxAge` on the `StagedExam` table. All the data in the column will be lost.
  - You are about to drop the column `minAge` on the `StagedExam` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `StagedLifecycleEvent` table. All the data in the column will be lost.
  - You are about to drop the column `isImportant` on the `StagedLifecycleEvent` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "LifecycleEvent_eventType_idx";

-- DropIndex
DROP INDEX "LifecycleEvent_examId_isImportant_idx";

-- DropIndex
DROP INDEX "LifecycleEvent_notificationSent_startsAt_idx";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "maxAge",
DROP COLUMN "minAge",
ADD COLUMN     "age" TEXT;

-- AlterTable
ALTER TABLE "LifecycleEvent" DROP COLUMN "eventType",
DROP COLUMN "isImportant";

-- AlterTable
ALTER TABLE "StagedExam" DROP COLUMN "maxAge",
DROP COLUMN "minAge",
ADD COLUMN     "age" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'NOTIFICATION';

-- AlterTable
ALTER TABLE "StagedLifecycleEvent" DROP COLUMN "eventType",
DROP COLUMN "isImportant";

-- CreateTable
CREATE TABLE "SeoPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "content" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "examId" TEXT,

    CONSTRAINT "SeoPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeoPage_slug_key" ON "SeoPage"("slug");

-- CreateIndex
CREATE INDEX "SeoPage_slug_idx" ON "SeoPage"("slug");

-- CreateIndex
CREATE INDEX "SeoPage_isPublished_idx" ON "SeoPage"("isPublished");

-- CreateIndex
CREATE INDEX "SeoPage_category_idx" ON "SeoPage"("category");

-- CreateIndex
CREATE INDEX "SeoPage_examId_idx" ON "SeoPage"("examId");

-- AddForeignKey
ALTER TABLE "SeoPage" ADD CONSTRAINT "SeoPage_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
