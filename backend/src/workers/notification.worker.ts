import { Worker, Job } from 'bullmq';
import { bullRedisConnection } from '../config/redis';
import { NOTIFICATION_QUEUE_NAME, NotificationJobData } from '../queues/notification.queue';
import { NotificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

/**
 * Optimized Processer for Notification Jobs
 * delegates all heavy lifting to NotificationService
 */
async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
    const { lifecycleEventId } = job.data;
    
    try {
        await NotificationService.handleLifecycleEventNotification(lifecycleEventId);
    } catch (error) {
        logger.error(`Error processing notification job ${job.id}:`, error);
        throw error; // Re-throw to BullMQ for retry
    }
}

/**
 * Initialize and start the notification worker
 */
export function startNotificationWorker(): Worker<NotificationJobData> {
    const worker = new Worker<NotificationJobData>(
        NOTIFICATION_QUEUE_NAME,
        processNotificationJob,
        {
            connection: bullRedisConnection,
            concurrency: 5, // Process up to 5 events in parallel
            limiter: {
                max: 100,
                duration: 1000 // Rate limit: 100 jobs per second
            }
        }
    );

    worker.on('completed', (job) => {
        logger.debug(`[Worker] Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
        logger.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
    });

    worker.on('error', (err) => {
        logger.error('[Worker] Fatal error:', err);
    });

    logger.info('🚀 Notification worker active and listening for jobs...');
    return worker;
}
