import cron from 'node-cron';
import { CronService } from '../services/cron.service';
import { logger } from '../utils/logger';

export function startCronWorker(): void {
    logger.info('🚀 Direct cron jobs initialized...');

    // Exam status sync every day at 1 AM
    cron.schedule('0 1 * * *', async () => {
        logger.debug('[CronWorker] Starting scheduled job: update-exam-statuses');
        try {
            await CronService.syncExamStatuses();
            logger.debug('[CronWorker] Scheduled job update-exam-statuses completed successfully');
        } catch (error) {
            logger.error('[CronWorker] Scheduled job update-exam-statuses failed:', error);
        }
    });

    // SarkariResult Pipeline check every 2 hours (0:00, 2:00, 4:00, 6:00, 8:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00)
    cron.schedule('0 */2 * * *', async () => {
        logger.info('[CronWorker] Starting scheduled job: sarkari-result-pipeline (every 2h)');
        try {
            await CronService.runSarkariResultPipeline();
            logger.info('[CronWorker] Scheduled job sarkari-result-pipeline completed');
        } catch (error) {
            logger.error('[CronWorker] Scheduled job sarkari-result-pipeline failed:', error);
        }
    });

    // Run once on startup to ensure fresh data
    CronService.syncExamStatuses().catch(err => {
        logger.error('[CronWorker] Initial status sync on startup failed:', err);
    });
}

