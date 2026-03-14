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

export const notificationBullQueue = new Queue<NotificationJobData>(
    NOTIFICATION_QUEUE_NAME,
    {
        connection: bullRedisConnection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
            removeOnComplete: 100,
            removeOnFail: 200,
        },
    }
);

notificationBullQueue.on('error', (err) => {
    logger.error('Notification queue error', { error: err.message });
});

class NotificationQueueService {
    async enqueueLifecycleNotification(data: NotificationJobData): Promise<void> {
        const { lifecycleEventId, startsAt, eventType } = data;

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
                delay,
                jobId: lifecycleEventId,
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
