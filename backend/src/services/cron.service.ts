import prisma from '../config/database';
import { ExamStatus } from '../constants/enums';
import { ExamStatusResolver } from './scraper/examStatusResolver';
import { logger } from '../utils/logger';

export class CronService {

    static async syncExamStatuses(): Promise<void> {
        const BATCH_SIZE = 100;
        const nowMs = Date.now();
        logger.info(`[CRON] Exam status sync started (Batch Size: ${BATCH_SIZE})`);

        let skip = 0;
        let totalProcessed = 0;
        const updates: { id: string; status: ExamStatus }[] = [];
        const auditLogs: string[] = [];

        while (true) {
            const batch = await prisma.exam.findMany({
                where: { isPublished: true },
                select: {
                    id: true,
                    slug: true,
                    shortTitle: true,
                    status: true,
                    lifecycleEvents: {
                        select: {
                            stage: true,
                            stageOrder: true,
                            startsAt: true,
                            endsAt: true,
                            isTBD: true,
                            actionUrl: true,
                            description: true
                        },
                        orderBy: { stageOrder: 'asc' },
                    },
                },
                skip,
                take: BATCH_SIZE,
            });

            if (batch.length === 0) break;

            for (const exam of batch) {
                const target = ExamStatusResolver.resolveStatus(exam.lifecycleEvents, new Date(nowMs));
                if (target !== exam.status) {
                    updates.push({
                        id: exam.id,
                        status: target
                    });
                    auditLogs.push(`  ${exam.slug}: ${exam.status} → ${target}`);
                }
            }

            totalProcessed += batch.length;
            skip += BATCH_SIZE;

            if (batch.length < BATCH_SIZE) break;
        }

        if (updates.length === 0) {
            logger.info(`[CRON] All ${totalProcessed} exams are up-to-date.`);
            return;
        }

        // Apply updates in transactions
        const CHUNK_SIZE = 50;
        for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
            const chunk = updates.slice(i, i + CHUNK_SIZE);
            await prisma.$transaction(
                chunk.map(u => prisma.exam.update({
                    where: { id: u.id },
                    data: { status: u.status }
                }))
            );
        }

        logger.info(`[CRON] Updated ${updates.length}/${totalProcessed} exams:\n${auditLogs.join('\n')}`);

        // Automatically sync trending exams based on fresh dates and active stages
        try {
            const { TrendingService } = await import('./scraper/trending.service');
            await TrendingService.syncTrendingExams();
        } catch (trendErr: any) {
            logger.warn(`[CRON] Trending sync failed: ${trendErr.message}`);
        }
    }

    static async runSarkariResultPipeline(): Promise<void> {
        logger.info('[CRON] Scheduled SarkariResult pipeline run starting (every 2 hours)...');
        try {
            const { SarkariResultPipeline } = await import('./scraper/sarkariResult.pipeline');
            const summary = await SarkariResultPipeline.runPipeline({
                maxEntries: 60,
                delayMs: 800,
                autoPromoteNew: true, // Auto-promotes properly validated exams to main Exam table!
            });
            logger.info(
                `[CRON] SarkariResult pipeline completed. Scanned: ${summary.totalScanned}, ` +
                `New: ${summary.newStagedCount}, Promoted: ${summary.promotedCount}, ` +
                `Updated: ${summary.updatedCount}, UpToDate: ${summary.upToDateCount}, Skipped: ${summary.skippedCount}`,
            );
        } catch (err: any) {
            logger.error(`[CRON] SarkariResult pipeline failed: ${err.message}`);
        }
    }
}
