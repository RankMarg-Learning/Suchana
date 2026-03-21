import { Worker, Job } from 'bullmq';
import { bullRedisConnection } from '../config/redis';
import { CRON_QUEUE_NAME } from '../queues/cron.queue';
import { CronService } from '../services/cron.service';
import { logger } from '../utils/logger';

async function processCronJob(job: Job): Promise<void> {
    const { name } = job;

    try {
        switch (name) {
            case 'update-exam-statuses':
                await CronService.syncExamStatuses();
                break;
            default:
                logger.warn(`Unknown cron job: ${name}`);
        }
    } catch (error) {
        logger.error(`Error processing cron job ${job.id} (name: ${name}):`, error);
        throw error;
    }
}

export function startCronWorker(): Worker {
    const worker = new Worker(
        CRON_QUEUE_NAME,
        processCronJob,
        {
            connection: bullRedisConnection,
            concurrency: 1, // Only 1 cron job at a time
        }
    );

    worker.on('completed', (job) => {
        logger.debug(`[CronWorker] Job ${job.id} (${job.name}) completed successfully`);
    });

    worker.on('failed', (job, err) => {
        logger.error(`[CronWorker] Job ${job?.id} failed: ${err.message}`);
    });

    worker.on('error', (err) => {
        logger.error('[CronWorker] Fatal error:', err);
    });

    logger.info('🚀 Cron worker active and listening for repeat jobs...');
    return worker;
}
