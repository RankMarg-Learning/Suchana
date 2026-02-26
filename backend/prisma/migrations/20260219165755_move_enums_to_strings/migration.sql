/*
  Warnings:

  - The `status` column on the `Exam` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `NotificationLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `category` on the `Exam` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `eventType` on the `LifecycleEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `platform` on the `PushToken` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'UPCOMING';

-- AlterTable
ALTER TABLE "LifecycleEvent" DROP COLUMN "eventType",
ADD COLUMN     "eventType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "NotificationLog" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "PushToken" DROP COLUMN "platform",
ADD COLUMN     "platform" TEXT NOT NULL;

-- DropEnum
DROP TYPE "ExamCategory";

-- DropEnum
DROP TYPE "ExamStatus";

-- DropEnum
DROP TYPE "LifecycleEventType";

-- DropEnum
DROP TYPE "NotificationStatus";

-- DropEnum
DROP TYPE "PushPlatform";

-- CreateIndex
CREATE INDEX "Exam_category_idx" ON "Exam"("category");

-- CreateIndex
CREATE INDEX "Exam_status_idx" ON "Exam"("status");

-- CreateIndex
CREATE INDEX "Exam_isPublished_status_idx" ON "Exam"("isPublished", "status");

-- CreateIndex
CREATE INDEX "LifecycleEvent_eventType_idx" ON "LifecycleEvent"("eventType");

-- CreateIndex
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");
