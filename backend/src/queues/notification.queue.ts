import { Queue } from 'bullmq';
import { bullRedisConnection } from '../config/redis';
import { logger } from '../utils/logger';
import { LifecycleStage } from '../constants/enums';

export const NOTIFICATION_QUEUE_NAME = 'exam-notifications';

export enum NotificationJobType {
    LIFECYCLE_EVENT = 'LIFECYCLE_EVENT',
    NEW_EXAM = 'NEW_EXAM',
    MANUAL = 'MANUAL'
}

export interface NotificationJobData {
    type: NotificationJobType;
    lifecycleEventId?: string;
    examId?: string;
    examTitle?: string;
    eventTitle?: string;
    eventType?: string; // Backwards compatibility if needed, but we use stage now
    stage?: string;
    startsAt?: Date | null;
    title?: string;
    body?: string;
    targetAudience?: 'BOOKMARKED' | 'INTERESTED';
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
    async enqueueLifecycleNotification(data: Omit<NotificationJobData, 'type'>): Promise<void> {
        const { lifecycleEventId, startsAt, stage } = data;

        if (!startsAt || !lifecycleEventId) {
            logger.info(`Notification skipping queue for invalid/TBD event ${lifecycleEventId}`);
            return;
        }

        const now = new Date();
        const delay = Math.max(0, new Date(startsAt).getTime() - now.getTime());

        await notificationBullQueue.add(
            `lifecycle:${stage}:${lifecycleEventId}`,
            { ...data, type: NotificationJobType.LIFECYCLE_EVENT },
            {
                delay,
                jobId: `lifecycle-${lifecycleEventId}`,
            }
        );

        logger.info(`Notification queued for event ${lifecycleEventId}`, {
            stage,
            startsAt: new Date(startsAt).toISOString(),
            delayMs: delay,
        });
    }

    async enqueueNewExamNotification(examId: string): Promise<void> {
        await notificationBullQueue.add(
            `new-exam:${examId}`,
            { type: NotificationJobType.NEW_EXAM, examId },
            { jobId: `new-exam-${examId}` }
        );
        logger.info(`Notification queued for NEW EXAM ${examId}`);
    }

    async enqueueManualNotification(
        examId: string, 
        title: string, 
        body: string, 
        targetAudience: 'BOOKMARKED' | 'INTERESTED' = 'BOOKMARKED'
    ): Promise<void> {
        await notificationBullQueue.add(
            `manual-${examId}-${Date.now()}`,
            { type: NotificationJobType.MANUAL, examId, title, body, targetAudience }
        );
    }

    async removeJob(lifecycleEventId: string): Promise<void> {
        const job = await notificationBullQueue.getJob(`lifecycle-${lifecycleEventId}`);
        if (job) {
            await job.remove();
            logger.debug(`Notification job removed: ${lifecycleEventId}`);
        }
    }
}

export const notificationQueue = new NotificationQueueService();
