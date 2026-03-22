import { Queue } from 'bullmq';
import { bullRedisConnection } from '../config/redis';
import { logger } from '../utils/logger';

export const CRON_QUEUE_NAME = 'cron-jobs';

export const cronQueue = new Queue(CRON_QUEUE_NAME, {
    connection: bullRedisConnection,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: { age: 24 * 3600 }
    }
});

export const setupRepeatableJobs = async () => {

    await cronQueue.add(
        'update-exam-statuses',
        {},
        {
            repeat: { pattern: '0 */4 * * *' },
            jobId: 'sync-exam-statuses-repeat'
        }
    );

    logger.info('✅ Repeatable cron jobs scheduled (Exam Status Sync every 4h)');
};
