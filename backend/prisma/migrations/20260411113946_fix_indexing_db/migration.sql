-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "examYear" INTEGER,
ADD COLUMN     "isTrending" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SeoPage" ADD COLUMN     "isTrending" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "StagedExam" ADD COLUMN     "examYear" INTEGER;

-- CreateIndex
CREATE INDEX "Exam_isTrending_idx" ON "Exam"("isTrending");

-- CreateIndex
CREATE INDEX "Exam_isPublished_isTrending_idx" ON "Exam"("isPublished", "isTrending");

-- CreateIndex
CREATE INDEX "Exam_examYear_idx" ON "Exam"("examYear");

-- CreateIndex
CREATE INDEX "SeoPage_isTrending_idx" ON "SeoPage"("isTrending");

-- CreateIndex
CREATE INDEX "SeoPage_isPublished_isTrending_idx" ON "SeoPage"("isPublished", "isTrending");

-- CreateIndex
CREATE INDEX "StagedExam_examYear_idx" ON "StagedExam"("examYear");
