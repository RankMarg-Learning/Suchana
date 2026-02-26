-- CreateEnum
CREATE TYPE "ExamCategory" AS ENUM ('UPSC', 'SSC', 'BANKING', 'RAILWAY', 'DEFENCE', 'STATE_PSC', 'TEACHING', 'POLICE', 'OTHER');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LifecycleEventType" AS ENUM ('NOTIFICATION_OUT', 'REGISTRATION_START', 'REGISTRATION_END', 'CORRECTION_WINDOW_START', 'CORRECTION_WINDOW_END', 'ADMIT_CARD_RELEASE', 'EXAM_DATE', 'ANSWER_KEY_RELEASE', 'RESULT_DECLARED', 'CUTOFF_RELEASE', 'INTERVIEW_DATE', 'JOINING_DATE', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "PushPlatform" AS ENUM ('FCM', 'APNS');

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" "ExamCategory" NOT NULL,
    "conductingBody" TEXT NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'UPCOMING',
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "minQualification" TEXT,
    "totalVacancies" INTEGER,
    "applicationFee" JSONB,
    "officialWebsite" TEXT,
    "notificationUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifecycleEvent" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "eventType" "LifecycleEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "actionUrl" TEXT,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifecycleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "PushPlatform" NOT NULL,
    "deviceModel" TEXT,
    "appVersion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "lifecycleEventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "targetTokens" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "beforeState" JSONB,
    "afterState" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exam_slug_key" ON "Exam"("slug");

-- CreateIndex
CREATE INDEX "Exam_category_idx" ON "Exam"("category");

-- CreateIndex
CREATE INDEX "Exam_status_idx" ON "Exam"("status");

-- CreateIndex
CREATE INDEX "Exam_conductingBody_idx" ON "Exam"("conductingBody");

-- CreateIndex
CREATE INDEX "Exam_isPublished_status_idx" ON "Exam"("isPublished", "status");

-- CreateIndex
CREATE INDEX "LifecycleEvent_examId_idx" ON "LifecycleEvent"("examId");

-- CreateIndex
CREATE INDEX "LifecycleEvent_eventType_idx" ON "LifecycleEvent"("eventType");

-- CreateIndex
CREATE INDEX "LifecycleEvent_scheduledAt_idx" ON "LifecycleEvent"("scheduledAt");

-- CreateIndex
CREATE INDEX "LifecycleEvent_notificationSent_scheduledAt_idx" ON "LifecycleEvent"("notificationSent", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");

-- CreateIndex
CREATE INDEX "PushToken_userId_idx" ON "PushToken"("userId");

-- CreateIndex
CREATE INDEX "PushToken_isActive_idx" ON "PushToken"("isActive");

-- CreateIndex
CREATE INDEX "NotificationLog_lifecycleEventId_idx" ON "NotificationLog"("lifecycleEventId");

-- CreateIndex
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");

-- CreateIndex
CREATE INDEX "NotificationLog_createdAt_idx" ON "NotificationLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entityType_entityId_idx" ON "AdminAuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "LifecycleEvent" ADD CONSTRAINT "LifecycleEvent_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_lifecycleEventId_fkey" FOREIGN KEY ("lifecycleEventId") REFERENCES "LifecycleEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
