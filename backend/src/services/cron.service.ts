import prisma from '../config/database';
import { ExamStatus, LifecycleStage, getStatusFromStage, getTerminalStatusFromStage } from '../constants/enums';
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
        const wEnd = dayEnd(ev.startsAt, ev.endsAt);

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

    const latest = sorted[latestIdx];
    const isLast = latestIdx === sorted.length - 1;
    const wEnd = dayEnd(latest.startsAt!, latest.endsAt);

    if (!isLast) {
        const next = sorted[latestIdx + 1];
        if (next.stage === LifecycleStage.ADMIT_CARD) return ExamStatus.ADMIT_CARD_COMING_SOON;
        if (next.stage === LifecycleStage.RESULT) return ExamStatus.RESULT_COMING_SOON;

        return getTerminalStatusFromStage(latest.stage);
    }

    if (nowMs - wEnd > ARCHIVE_AFTER_MS) return ExamStatus.ARCHIVED;

    return getTerminalStatusFromStage(latest.stage);
}

function generateDynamicTitle(shortTitle: string, status: ExamStatus): string {
    const yearMatch = shortTitle.match(/\b(20\d{2})\b/);
    const year = yearMatch ? yearMatch[1] : '';
    const name = shortTitle.replace(/\b20\d{2}\b/, '').replace(/\s+/g, ' ').trim();
    const yearSuffix = year ? ` ${year}` : '';

    switch (status) {
        case ExamStatus.REGISTRATION_OPEN:
            const recruitmentLabel = name.toLowerCase().includes('recruitment') ? '' : ' Recruitment';
            return `${name}${recruitmentLabel}${yearSuffix} – Apply Online`.trim();
        case ExamStatus.ADMIT_CARD_OUT:
            return `${name} Admit Card${yearSuffix} OUT`.trim();
        case ExamStatus.RESULT_DECLARED:
            return `${name} Result${yearSuffix} OUT – Check Scorecard`.trim();
        case ExamStatus.ANSWER_KEY_OUT:
            return `${name} Answer Key${yearSuffix} OUT`.trim();
        default:
            const defaultLabel = name.toLowerCase().includes('recruitment') ? '' : ' Recruitment';
            return `${name}${defaultLabel}${yearSuffix}`.trim();
    }
}

export class CronService {

    static async syncExamStatuses(): Promise<void> {
        const BATCH_SIZE = 100;
        const nowMs = Date.now();
        logger.info(`[CRON] Exam status sync started (Batch Size: ${BATCH_SIZE})`);

        let skip = 0;
        let totalProcessed = 0;
        const updates: { id: string; status: ExamStatus; title: string }[] = [];
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
                        select: { stage: true, stageOrder: true, startsAt: true, endsAt: true, isTBD: true },
                        orderBy: { stageOrder: 'asc' },
                    },
                },
                skip,
                take: BATCH_SIZE,
            });

            if (batch.length === 0) break;

            for (const exam of batch) {
                const target = deriveStatus(exam.lifecycleEvents as SlimEvent[], nowMs);
                if (target !== exam.status) {
                    const newTitle = generateDynamicTitle(exam.shortTitle, target as ExamStatus);
                    updates.push({
                        id: exam.id,
                        status: target as ExamStatus,
                        title: newTitle
                    });
                    auditLogs.push(`  ${exam.slug}: ${exam.status} → ${target} | title: ${newTitle}`);
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
                    data: { status: u.status, title: u.title }
                }))
            );
        }

        logger.info(`[CRON] Updated ${updates.length}/${totalProcessed} exams:\n${auditLogs.join('\n')}`);
    }
}
