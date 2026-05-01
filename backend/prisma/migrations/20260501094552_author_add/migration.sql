-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "authorId" TEXT;

-- AlterTable
ALTER TABLE "SeoPage" ADD COLUMN     "authorId" TEXT;

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "designation" TEXT,
    "bio" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_slug_key" ON "Author"("slug");

-- CreateIndex
CREATE INDEX "Author_slug_idx" ON "Author"("slug");

-- CreateIndex
CREATE INDEX "Author_isActive_idx" ON "Author"("isActive");

-- CreateIndex
CREATE INDEX "Exam_authorId_idx" ON "Exam"("authorId");

-- CreateIndex
CREATE INDEX "SeoPage_authorId_idx" ON "SeoPage"("authorId");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoPage" ADD CONSTRAINT "SeoPage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE;
