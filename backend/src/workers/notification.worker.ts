import { Worker, Job } from 'bullmq';
import { bullRedisConnection } from '../config/redis';
import prisma from '../config/database';
import { NOTIFICATION_QUEUE_NAME, NotificationJobData } from '../queues/notification.queue';
import { getActiveTokensForBroadcast } from '../services/pushToken.service';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { NotificationStatus } from '../constants/enums';

interface FcmResult {
    successCount: number;
    failureCount: number;
    errorMessage?: string;
}

async function sendFcmNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
): Promise<FcmResult> {
    if (!env.FCM_PROJECT_ID || !env.FCM_CLIENT_EMAIL || !env.FCM_PRIVATE_KEY) {
        logger.warn('FCM credentials not configured — notification delivery skipped (dev mode)');
        return { successCount: tokens.length, failureCount: 0 };
    }

    try {
        // Dynamic import to avoid crash if firebase-admin not installed
        // @ts-ignore
        const admin = await import('firebase-admin').catch(() => null);
        if (!admin) {
            logger.warn('firebase-admin not installed — skipping FCM delivery');
            return { successCount: 0, failureCount: tokens.length, errorMessage: 'firebase-admin not installed' };
        }

        // Initialize app once
        if (!admin.default.apps.length) {
            admin.default.initializeApp({
                credential: admin.default.credential.cert({
                    projectId: env.FCM_PROJECT_ID,
                    clientEmail: env.FCM_CLIENT_EMAIL,
                    privateKey: env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        }

        // Send in batches of 500 (FCM limit)
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

// ─── Job Processor ────────────────────────────────────────────
async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
    const { lifecycleEventId, examTitle, eventTitle, eventType } = job.data;

    logger.info(`Processing notification job ${job.id}`, { lifecycleEventId, eventType });

    // Check if already sent (idempotency)
    const lifecycleEvent = await prisma.lifecycleEvent.findUnique({
        where: { id: lifecycleEventId },
    });
    if (!lifecycleEvent) {
        logger.warn(`Lifecycle event ${lifecycleEventId} not found — skipping`);
        return;
    }
    if (lifecycleEvent.notificationSent) {
        logger.info(`Notification already sent for event ${lifecycleEventId} — skipping`);
        return;
    }

    // Get active tokens
    const tokens = await getActiveTokensForBroadcast();
    if (tokens.length === 0) {
        logger.warn(`No active push tokens — skipping notification for ${lifecycleEventId}`);
        await prisma.lifecycleEvent.update({
            where: { id: lifecycleEventId },
            data: { notificationSent: true, notifiedAt: new Date() },
        });
        return;
    }

    const title = `📢 ${examTitle}`;
    const body = eventTitle;
    const data: Record<string, string> = {
        lifecycleEventId,
        eventType,
        examTitle,
    };

    // Create log entry (pending)
    const notifLog = await prisma.notificationLog.create({
        data: {
            lifecycleEventId,
            title,
            body,
            data: data as Record<string, string>,
            targetTokens: tokens.length,
            status: 'QUEUED' as NotificationStatus,
        },
    });

    // Send
    const result = await sendFcmNotification(tokens, title, body, data);

    // Update log + mark event notified
    await Promise.all([
        prisma.notificationLog.update({
            where: { id: notifLog.id },
            data: {
                successCount: result.successCount,
                failureCount: result.failureCount,
                status: result.errorMessage ? ('FAILED' as NotificationStatus) : ('SENT' as NotificationStatus),
                errorMessage: result.errorMessage,
                sentAt: new Date(),
            },
        }),
        prisma.lifecycleEvent.update({
            where: { id: lifecycleEventId },
            data: { notificationSent: true, notifiedAt: new Date() },
        }),
    ]);

    logger.info(`Notification sent for event ${lifecycleEventId}`, {
        successCount: result.successCount,
        failureCount: result.failureCount,
    });
}

// ─── Worker Instance ──────────────────────────────────────────
export function startNotificationWorker(): Worker<NotificationJobData> {
    const worker = new Worker<NotificationJobData>(
        NOTIFICATION_QUEUE_NAME,
        processNotificationJob,
        {
            connection: bullRedisConnection,
            concurrency: 5,
        }
    );

    worker.on('completed', (job) => {
        logger.info(`Notification job completed: ${job.id}`);
    });

    worker.on('failed', (job, err) => {
        logger.error(`Notification job failed: ${job?.id}`, { error: err.message });
    });

    worker.on('error', (err) => {
        logger.error('Notification worker error', { error: err.message });
    });

    logger.info('Notification worker started');
    return worker;
}
