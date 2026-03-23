import prisma from '../config/database';
import { ExamStatus, getStatusFromStage, LifecycleStage } from '../constants/enums';
import { logger } from '../utils/logger';

export class CronService {

    static async syncExamStatuses() {
        const now = new Date();

        logger.info(`[CRON] Starting exam status sync at ${now.toISOString()}...`);

        const exams = await prisma.exam.findMany({
            where: { isPublished: true },
            include: {
                lifecycleEvents: {
                    orderBy: { stageOrder: 'asc' }
                }
            }
        });

        let updatedCount = 0;
        const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;

        for (const exam of exams) {
            const events = exam.lifecycleEvents;
            if (events.length === 0) continue;

            let targetStatus: string | null = null;

            const startedEvents = events.filter(ev => ev.startsAt && ev.startsAt <= now);
            const latestStarted = startedEvents.length > 0 ? startedEvents[startedEvents.length - 1] : null;

            if (latestStarted) {
                const nextEvent = events.find(ev => ev.stageOrder > latestStarted.stageOrder);
                const isLastEvent = !nextEvent;

                const startOfDay = new Date(latestStarted.startsAt!);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = latestStarted.endsAt ? new Date(latestStarted.endsAt) : new Date(latestStarted.startsAt!);
                endOfDay.setHours(23, 59, 59, 999);

                const isCurrentlyHappening = now >= startOfDay && now <= endOfDay;
                const isPast = now > endOfDay;

                if (latestStarted.isTBD) {
                    targetStatus = ExamStatus.ACTIVE;
                } else if (isCurrentlyHappening) {
                    targetStatus = getStatusFromStage(latestStarted.stage) || ExamStatus.ACTIVE;
                } else if (isPast) {
                    let pastStatus = getStatusFromStage(latestStarted.stage) || ExamStatus.ACTIVE;

                    if (latestStarted.stage === LifecycleStage.EXAM) {
                        pastStatus = ExamStatus.ACTIVE;
                    } else if (latestStarted.stage === LifecycleStage.REGISTRATION) {
                        pastStatus = ExamStatus.REGISTRATION_CLOSED;
                    }

                    if (isLastEvent) {
                        if (now.getTime() - endOfDay.getTime() > twoWeeksInMs) {
                            targetStatus = ExamStatus.ARCHIVED;
                        } else {
                            targetStatus = pastStatus;
                        }
                    } else {
                        targetStatus = pastStatus;
                    }
                }
            } else {
                targetStatus = ExamStatus.ACTIVE;
            }

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
