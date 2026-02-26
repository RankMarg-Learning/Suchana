// ============================================================
// src/queues/notification.queue.ts  — BullMQ notification queue
// ============================================================
import { Queue } from 'bullmq';
import { bullRedisConnection } from '../config/redis';
import { logger } from '../utils/logger';
import { LifecycleEventType } from '../constants/enums';

export const NOTIFICATION_QUEUE_NAME = 'exam-notifications';

export interface NotificationJobData {
    lifecycleEventId: string;
    examTitle: string;
    eventTitle: string;
    eventType: LifecycleEventType;
    startsAt: Date | null;
}

// Singleton queue
export const notificationBullQueue = new Queue<NotificationJobData>(
    NOTIFICATION_QUEUE_NAME,
    {
        connection: bullRedisConnection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000, // 5s, 10s, 20s
            },
            removeOnComplete: 100, // Keep last 100 completed jobs
            removeOnFail: 200,     // Keep last 200 failed jobs
        },
    }
);

notificationBullQueue.on('error', (err) => {
    logger.error('Notification queue error', { error: err.message });
});

class NotificationQueueService {
    async enqueueLifecycleNotification(data: NotificationJobData): Promise<void> {
        const { lifecycleEventId, startsAt, eventType } = data;

        // Don't queue scheduled notifications for TBD dates
        if (!startsAt) {
            logger.info(`Notification skipping queue for TBD event ${lifecycleEventId}`);
            return;
        }

        const now = new Date();
        const delay = Math.max(0, new Date(startsAt).getTime() - now.getTime());

        await notificationBullQueue.add(
            `lifecycle:${eventType}:${lifecycleEventId}`,
            data,
            {
                delay,           // Schedule delivery at event time
                jobId: lifecycleEventId, // Deduplicate by event ID
            }
        );

        logger.info(`Notification queued for event ${lifecycleEventId}`, {
            eventType,
            startsAt: new Date(startsAt).toISOString(),
            delayMs: delay,
        });
    }

    async removeJob(lifecycleEventId: string): Promise<void> {
        const job = await notificationBullQueue.getJob(lifecycleEventId);
        if (job) {
            await job.remove();
            logger.debug(`Notification job removed: ${lifecycleEventId}`);
        }
    }
}

export const notificationQueue = new NotificationQueueService();
