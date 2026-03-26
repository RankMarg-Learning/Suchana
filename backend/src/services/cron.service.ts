import prisma from '../config/database';
import { ExamStatus, getStatusFromStage, getTerminalStatusFromStage } from '../constants/enums';
import { logger } from '../utils/logger';

const ARCHIVE_AFTER_MS = 14 * 24 * 60 * 60 * 1000;

const dayStart = (d: Date) => {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c.getTime();
};

const dayEnd = (startsAt: Date, endsAt: Date | null) => {
    const base = endsAt ? new Date(endsAt) : new Date(startsAt);
    base.setHours(23, 59, 59, 999);
    return base.getTime();
};

type SlimEvent = {
    stage: string;
    stageOrder: number;
    startsAt: Date | null;
    endsAt: Date | null;
    isTBD: boolean;
};

function deriveStatus(events: SlimEvent[], nowMs: number): ExamStatus {
    const sorted = events.slice().sort((a, b) => a.stageOrder - b.stageOrder);

    for (let i = sorted.length - 1; i >= 0; i--) {
        const ev = sorted[i];
        if (!ev.startsAt) continue;

        const wStart = dayStart(ev.startsAt);
        const wEnd   = dayEnd(ev.startsAt, ev.endsAt);

        if (nowMs >= wStart && nowMs <= wEnd) {
            return getStatusFromStage(ev.stage) ?? ExamStatus.ACTIVE;
        }
    }

    let latestIdx = -1;
    for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].startsAt && sorted[i].startsAt!.getTime() <= nowMs) {
            latestIdx = i;
        }
    }

    if (latestIdx === -1) return ExamStatus.NOTIFICATION;

    const latest   = sorted[latestIdx];
    const isLast   = latestIdx === sorted.length - 1;
    const wEnd     = dayEnd(latest.startsAt!, latest.endsAt);

    if (!isLast) return ExamStatus.ACTIVE;

    if (nowMs - wEnd > ARCHIVE_AFTER_MS) return ExamStatus.ARCHIVED;

    return getTerminalStatusFromStage(latest.stage);
}

export class CronService {

    static async syncExamStatuses(): Promise<void> {
        const nowMs = Date.now();
        logger.info(`[CRON] Exam status sync started`);

        const exams = await prisma.exam.findMany({
            where: { isPublished: true },
            select: {
                id: true,
                slug: true,
                status: true,
                lifecycleEvents: {
                    select: { stage: true, stageOrder: true, startsAt: true, endsAt: true, isTBD: true },
                    orderBy: { stageOrder: 'asc' },
                },
            },
        });

        const buckets = new Map<string, string[]>();
        const logLines: string[] = [];

        for (const exam of exams) {
            const target = deriveStatus(exam.lifecycleEvents as SlimEvent[], nowMs);
            if (target === exam.status) continue;

            const ids = buckets.get(target) ?? [];
            ids.push(exam.id);
            buckets.set(target, ids);
            logLines.push(`  ${exam.slug}: ${exam.status} → ${target}`);
        }

        if (buckets.size === 0) {
            logger.info(`[CRON] All ${exams.length} exams already up-to-date.`);
            return;
        }

        await Promise.all(
            Array.from(buckets.entries()).map(([status, ids]) =>
                prisma.exam.updateMany({
                    where: { id: { in: ids } },
                    data: { status },
                })
            )
        );

        const total = logLines.reduce((s, _, i, a) => i === 0 ? s + a.length : s, 0);
        logger.info(`[CRON] Updated ${total}/${exams.length} exams:\n${logLines.join('\n')}`);
    }
}
