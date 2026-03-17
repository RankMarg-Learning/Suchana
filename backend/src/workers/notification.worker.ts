import { Worker, Job } from 'bullmq';
import { bullRedisConnection } from '../config/redis';
import { NOTIFICATION_QUEUE_NAME, NotificationJobData, NotificationJobType } from '../queues/notification.queue';
import { NotificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
    const { type, lifecycleEventId, examId, title, body } = job.data;

    try {
        switch (type) {
            case NotificationJobType.LIFECYCLE_EVENT:
                if (lifecycleEventId) {
                    await NotificationService.handleLifecycleEventNotification(lifecycleEventId);
                }
                break;
            case NotificationJobType.NEW_EXAM:
                if (examId) {
                    await NotificationService.handleNewExamNotification(examId);
                }
                break;
            case NotificationJobType.MANUAL:
                if (examId && title && body) {
                    await NotificationService.sendManualExamNotification(
                        examId, 
                        title, 
                        body, 
                        job.data.targetAudience
                    );
                }
                break;
            default:
                logger.warn(`Unknown notification job type: ${type}`);
        }
    } catch (error) {
        logger.error(`Error processing notification job ${job.id} (type: ${type}):`, error);
        throw error;
    }
}

export function startNotificationWorker(): Worker<NotificationJobData> {
    const worker = new Worker<NotificationJobData>(
        NOTIFICATION_QUEUE_NAME,
        processNotificationJob,
        {
            connection: bullRedisConnection,
            concurrency: 5,
            limiter: {
                max: 100,
                duration: 1000
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
