import prisma from '../config/database';
import { ExamStatus, getStatusFromStage } from '../constants/enums';
import { logger } from '../utils/logger';

export class CronService {
    /**
     * Core Sync Logic: Sync Exam statuses based on lifecycle event timelines.
     * This runs every 4h and checks all published exams.
     */
    static async syncExamStatuses() {
        const now = new Date();
        const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
        
        logger.info(`[CRON] Starting exam status sync at ${now.toISOString()}...`);

        // Fetch published exams. 
        // User mentioned "update exam of all exam which is update this last 4 hr".
        // This likely means exams whose lifecycle events were updated by a scraper in the last 4 hours.
        // We'll broaden it to check all published exams to ensure no time-based 
        // status changes are missed even if the record wasn't updated.
        const exams = await prisma.exam.findMany({
            where: { isPublished: true },
            include: {
                lifecycleEvents: {
                    orderBy: { stageOrder: 'asc' }
                }
            }
        });

        let updatedCount = 0;

        for (const exam of exams) {
            const events = exam.lifecycleEvents;
            if (events.length === 0) continue;

            let targetStatus: string | null = null;
            const now = new Date();

            // Find the highest stageOrder event that has started
            const startedEvents = events.filter(ev => ev.startsAt && ev.startsAt <= now);
            const latestStarted = startedEvents.length > 0 ? startedEvents[startedEvents.length - 1] : null;

            if (latestStarted) {
                // If it's ongoing
                const isOngoing = !latestStarted.endsAt || latestStarted.endsAt >= now;
                
                if (isOngoing) {
                    if (latestStarted.isTBD) {
                        const hasNext = events.some(ev => ev.stageOrder > latestStarted.stageOrder);
                        targetStatus = hasNext ? ExamStatus.ACTIVE : ExamStatus.ARCHIVED;
                    } else {
                        targetStatus = getStatusFromStage(latestStarted.stage) || ExamStatus.ACTIVE;
                    }
                } else {
                    // It's finished. Check for next upcoming
                    const nextEvent = events.find(ev => ev.stageOrder > latestStarted.stageOrder);
                    if (nextEvent) {
                        targetStatus = ExamStatus.ACTIVE;
                    } else {
                        targetStatus = ExamStatus.ARCHIVED;
                    }
                }
            } else {
                // No event has started yet.
                const firstEvent = events[0];
                if (firstEvent.isTBD) {
                     targetStatus = ExamStatus.ACTIVE;
                } else {
                     targetStatus = getStatusFromStage(firstEvent.stage) || ExamStatus.NOTIFICATION;
                }
            }

            // Apply update only if status changed
            if (targetStatus && targetStatus !== exam.status) {
                try {
                    await prisma.exam.update({
                        where: { id: exam.id },
                        data: { status: targetStatus as any }
                    });
                    updatedCount++;
                    logger.info(`[CRON] ${exam.slug}: ${exam.status} -> ${targetStatus}`);
                } catch (err) {
                    logger.error(`[CRON] Failed to update ${exam.slug}:`, err);
                }
            }
        }

        logger.info(`[CRON] Exam status sync complete. Updated ${updatedCount} exams.`);
    }
}
