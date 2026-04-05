-- AlterTable
ALTER TABLE "LifecycleEvent" ADD COLUMN     "examSlug" TEXT;

-- CreateIndex
CREATE INDEX "Exam_createdAt_idx" ON "Exam"("createdAt");

-- CreateIndex
CREATE INDEX "Exam_updatedAt_idx" ON "Exam"("updatedAt");

-- CreateIndex
CREATE INDEX "Exam_isPublished_updatedAt_publishedAt_idx" ON "Exam"("isPublished", "updatedAt", "publishedAt");

-- CreateIndex
CREATE INDEX "Exam_category_isPublished_idx" ON "Exam"("category", "isPublished");

-- CreateIndex
CREATE INDEX "LifecycleEvent_examSlug_stage_idx" ON "LifecycleEvent"("examSlug", "stage");

-- CreateIndex
CREATE INDEX "SeoPage_createdAt_idx" ON "SeoPage"("createdAt");

-- CreateIndex
CREATE INDEX "SeoPage_category_isPublished_idx" ON "SeoPage"("category", "isPublished");
