-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "faqs" JSONB;

-- AlterTable
ALTER TABLE "SeoPage" ADD COLUMN     "faqs" JSONB;

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoPageTag" (
    "seoPageId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoPageTag_pkey" PRIMARY KEY ("seoPageId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "SeoPageTag_seoPageId_idx" ON "SeoPageTag"("seoPageId");

-- CreateIndex
CREATE INDEX "SeoPageTag_tagId_idx" ON "SeoPageTag"("tagId");

-- AddForeignKey
ALTER TABLE "SeoPageTag" ADD CONSTRAINT "SeoPageTag_seoPageId_fkey" FOREIGN KEY ("seoPageId") REFERENCES "SeoPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoPageTag" ADD CONSTRAINT "SeoPageTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
