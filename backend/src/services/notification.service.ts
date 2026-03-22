import { LifecycleStage, NotificationStatus } from '../constants/enums';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { NotificationTemplates, NotificationContent } from '../utils/notificationTemplates';

interface FcmResult {
    successCount: number;
    failureCount: number;
    errorMessage?: string;
}

export class NotificationService {


    static async getTargetUsersForEvent(params: {
        examId: string;
        category: string;
        examLevel: string;
        qualification?: string;
    }) {
        const { examId, category, examLevel, qualification } = params;

        return prisma.user.findMany({
            where: {
                notificationsEnabled: true,
                OR: [
                    { savedExamIds: { has: examId } },
                    {
                        AND: [
                            category ? { preferredCategories: { has: category } } : {},
                            examLevel ? { preferredExamLevel: examLevel } : {},
                            // Match qualification if available
                            qualification ? { qualification: { equals: qualification, mode: 'insensitive' } } : {}
                        ]
                    }
                ]
            },
            select: { id: true }
        });
    }


    static async getTokensForUsers(userIds: string[]): Promise<string[]> {
        const tokens = await prisma.pushToken.findMany({
            where: {
                userId: { in: userIds },
                isActive: true
            },
            select: { token: true }
        });
        return tokens.map(t => t.token);
    }


    static async sendToTokens(
        tokens: string[],
        title: string,
        body: string,
        data?: Record<string, string>
    ): Promise<FcmResult> {
        if (tokens.length === 0) return { successCount: 0, failureCount: 0 };

        if (!env.FCM_PROJECT_ID || !env.FCM_CLIENT_EMAIL || !env.FCM_PRIVATE_KEY) {
            logger.warn('FCM credentials missing — skipping delivery');
            return { successCount: tokens.length, failureCount: 0 }; // Mock success for dev
        }

        try {
            // @ts-ignore
            const admin = await import('firebase-admin').catch(() => null);
            if (!admin) throw new Error('firebase-admin not installed');

            if (!admin.default.apps.length) {
                admin.default.initializeApp({
                    credential: admin.default.credential.cert({
                        projectId: env.FCM_PROJECT_ID,
                        clientEmail: env.FCM_CLIENT_EMAIL,
                        privateKey: env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                    }),
                });
            }

            const BATCH_SIZE = 500;
            let successCount = 0;
            let failureCount = 0;

            for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
                const batch = tokens.slice(i, i + BATCH_SIZE);
                const response = await admin.default.messaging().sendEachForMulticast({
                    tokens: batch,
                    notification: { title, body },
                    data,
                    android: { priority: 'high' },
                    apns: { payload: { aps: { sound: 'default' } } },
                });
                successCount += response.successCount;
                failureCount += response.failureCount;

                // Handle token cleanup for invalid tokens
                if (response.failureCount > 0) {
                    const invalidTokens: string[] = [];
                    response.responses.forEach((resp: any, idx: number) => {
                        if (!resp.success && (
                            resp.error?.code === 'messaging/registration-token-not-registered' ||
                            resp.error?.code === 'messaging/invalid-registration-token'
                        )) {
                            invalidTokens.push(batch[idx]);
                        }
                    });
                    if (invalidTokens.length > 0) {
                        await prisma.pushToken.updateMany({
                            where: { token: { in: invalidTokens } },
                            data: { isActive: false }
                        });
                        logger.debug(`Deactivated ${invalidTokens.length} stale push tokens`);
                    }
                }
            }

            return { successCount, failureCount };
        } catch (error) {
            return {
                successCount: 0,
                failureCount: tokens.length,
                errorMessage: (error as Error).message,
            };
        }
    }

    /**
     * High-level orchestration for a lifecycle event notification
     */
    static async handleLifecycleEventNotification(eventId: string) {
        const event = await prisma.lifecycleEvent.findUnique({
            where: { id: eventId },
            include: { exam: true }
        });

        if (!event || event.notificationSent) return;

        logger.info(`Orchestrating event notification: ${event.exam.shortTitle} - ${event.title}`);

        const { title, body } = NotificationTemplates.getEventTemplate(
            event.exam.shortTitle,
            event.title,
            event.stage as LifecycleStage,
            event.startsAt || undefined
        );

        // 1. Get recipients
        const targetUsers = await this.getTargetUsersForEvent({
            examId: event.examId,
            category: event.exam.category,
            examLevel: event.exam.examLevel,
            qualification: event.exam.qualificationCriteria ?? undefined
        });

        const tokens = await this.getTokensForUsers(targetUsers.map(u => u.id));

        if (tokens.length === 0) {
            await prisma.lifecycleEvent.update({
                where: { id: eventId },
                data: { notificationSent: true, notifiedAt: new Date() }
            });
            return;
        }

        const payload = {
            examId: event.examId,
            eventId: event.id,
            stage: event.stage,
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
        };

        // 2. Create Audit Log
        const log = await prisma.notificationLog.create({
            data: {
                lifecycleEventId: event.id,
                title,
                body,
                data: payload as any,
                targetTokens: tokens.length,
                status: 'QUEUED' as NotificationStatus
            }
        });

        // 3. Send
        const result = await this.sendToTokens(tokens, title, body, payload);

        // 4. Update Audit + Event
        await Promise.all([
            prisma.notificationLog.update({
                where: { id: log.id },
                data: {
                    successCount: result.successCount,
                    failureCount: result.failureCount,
                    errorMessage: result.errorMessage,
                    status: result.errorMessage ? 'FAILED' : 'SENT',
                    sentAt: new Date()
                }
            }),
            prisma.lifecycleEvent.update({
                where: { id: eventId },
                data: { notificationSent: true, notifiedAt: new Date() }
            })
        ]);

        logger.info(`Notification complete. Targeted: ${tokens.length}, Success: ${result.successCount}`);
    }

    /**
     * Triggered when a new exam is promoted to the live database.
     */
    static async handleNewExamNotification(examId: string) {
        const exam = await prisma.exam.findUnique({
            where: { id: examId }
        });

        if (!exam) return;

        logger.info(`Orchestrating NEW EXAM notification: ${exam.shortTitle}`);

        const vacancies = exam.totalVacancies ? parseInt(exam.totalVacancies, 10) || undefined : undefined;

        const { title, body } = NotificationTemplates.getNewExamTemplate(
            exam.shortTitle,
            exam.category,
            vacancies
        );

        // 1. Get recipients who are NOT bookmarked (since it's new) but have matching preferences
        const targetUsers = await prisma.user.findMany({
            where: {
                notificationsEnabled: true,
                AND: [
                    { preferredCategories: { has: exam.category } },
                    { preferredExamLevel: exam.examLevel },
                ]
            },
            select: { id: true }
        });

        if (targetUsers.length === 0) return;

        const tokens = await this.getTokensForUsers(targetUsers.map(u => u.id));
        if (tokens.length === 0) return;

        const payload = {
            examId: exam.id,
            type: 'NEW_EXAM_NOTIFICATION',
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
        };

        const result = await this.sendToTokens(tokens, title, body, payload);
        logger.info(`New exam notification complete. Targeted: ${tokens.length}, Success: ${result.successCount}`);
    }

    /**
     * Sends an ad-hoc notification.
     * targetAudience: 'BOOKMARKED' (default) or 'INTERESTED' (bookmarks + preferences)
     */
    static async sendManualExamNotification(
        examId: string,
        title?: string,
        body?: string,
        targetAudience: 'BOOKMARKED' | 'INTERESTED' = 'BOOKMARKED'
    ) {
        const exam = await prisma.exam.findUnique({
            where: { id: examId }
        });

        if (!exam) throw new Error('Exam not found');

        let targetUsers;

        if (targetAudience === 'INTERESTED') {
            targetUsers = await this.getTargetUsersForEvent({
                examId: exam.id,
                category: exam.category,
                examLevel: exam.examLevel,
                qualification: exam.qualificationCriteria ?? undefined
            });
        } else {
            targetUsers = await prisma.user.findMany({
                where: {
                    notificationsEnabled: true,
                    savedExamIds: { has: examId }
                },
                select: { id: true }
            });
        }

        if (targetUsers.length === 0) return { successCount: 0, failureCount: 0, targetTokens: 0 };

        const tokens = await this.getTokensForUsers(targetUsers.map(u => u.id));

        if (tokens.length === 0) return { successCount: 0, failureCount: 0, targetTokens: 0 };

        const finalTitle = title || `📢 Update: ${exam.shortTitle}`;
        const finalBody = body || `The ${exam.shortTitle} status has changed. Tap for details.`;

        const payload = {
            examId: exam.id,
            type: 'MANUAL_EXAM_UPDATE',
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
        };

        const result = await this.sendToTokens(tokens, finalTitle, finalBody, payload);

        return { ...result, targetTokens: tokens.length };
    }
}
