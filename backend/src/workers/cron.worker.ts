import cron from 'node-cron';
import { CronService } from '../services/cron.service';
import { logger } from '../utils/logger';

export function startCronWorker(): void {
    logger.info('🚀 Direct cron jobs initialized...');

    // Exam status sync every 4 hours (matching the existing schedule: 0 */4 * * *)
    cron.schedule('0 */4 * * *', async () => {
        logger.debug('[CronWorker] Starting scheduled job: update-exam-statuses');
        try {
            await CronService.syncExamStatuses();
            logger.debug('[CronWorker] Scheduled job update-exam-statuses completed successfully');
        } catch (error) {
            logger.error('[CronWorker] Scheduled job update-exam-statuses failed:', error);
        }
    });

    // Run once on startup to ensure fresh data
    CronService.syncExamStatuses().catch(err => {
        logger.error('[CronWorker] Initial status sync on startup failed:', err);
    });
}

