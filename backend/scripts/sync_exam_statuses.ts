import prisma from '../src/config/database';
import { ExamStatusResolver } from '../src/services/scraper/examStatusResolver';
import { TrendingService } from '../src/services/scraper/trending.service';
import { STAGE_ORDER_MAP, LifecycleStage } from '../src/constants/enums';
import { cacheService } from '../src/utils/cache';
import { logger } from '../src/utils/logger';

async function main() {
    logger.info('Starting full database exam status synchronization...');
    const now = new Date();

    const exams = await prisma.exam.findMany({
        where: { isPublished: true },
        select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            lifecycleEvents: {
                select: {
                    id: true,
                    stage: true,
                    stageOrder: true,
                    startsAt: true,
                    endsAt: true,
                    isTBD: true,
                    actionUrl: true,
                    description: true,
                },
                orderBy: { stageOrder: 'asc' },
            },
        },
    });

    logger.info(`Found ${exams.length} published exams to evaluate.`);

    let updatedCount = 0;
    let eventsUpdatedCount = 0;
    const statusChanges: Record<string, number> = {};

    for (const exam of exams) {
        // Ensure stageOrder is synced with canonical STAGE_ORDER_MAP
        for (const ev of exam.lifecycleEvents) {
            const canonicalOrder = STAGE_ORDER_MAP[ev.stage as LifecycleStage];
            if (canonicalOrder && ev.stageOrder !== canonicalOrder) {
                await prisma.lifecycleEvent.update({
                    where: { id: ev.id },
                    data: { stageOrder: canonicalOrder },
                });
                ev.stageOrder = canonicalOrder;
                eventsUpdatedCount++;
            }
        }

        const sorted = [...exam.lifecycleEvents].sort((a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0));

        // Chain endsAt across lifecycle events
        for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const nextEventWithDate = sorted.slice(i + 1).find((e) => e.startsAt && !e.isTBD);
            if (!nextEventWithDate?.startsAt) continue;

            const nextStart = new Date(nextEventWithDate.startsAt);
            let newEndsAt: Date | null = null;

            if (current.stage === 'NOTIFICATION') {
                newEndsAt = nextStart;
            } else if (current.stage === 'EXAM_CITY') {
                const admitEvent = sorted.slice(i + 1).find((e) => (e.stage === 'ADMIT_CARD' || e.stage === 'EXAM') && e.startsAt && !e.isTBD);
                newEndsAt = admitEvent?.startsAt ? new Date(admitEvent.startsAt) : nextStart;
            } else if (current.stage === 'ADMIT_CARD') {
                const examEvent = sorted.slice(i + 1).find((e) => e.stage === 'EXAM' && e.startsAt && !e.isTBD);
                const targetExamStart = examEvent?.startsAt ? new Date(examEvent.startsAt) : nextStart;
                newEndsAt = targetExamStart;
            } else if (current.stage === 'ANSWER_KEY') {
                const resultEvent = sorted.slice(i + 1).find((e) => e.stage === 'RESULT' && e.startsAt && !e.isTBD);
                if (resultEvent?.startsAt) {
                    newEndsAt = new Date(resultEvent.startsAt);
                }
            } else if (!current.endsAt && current.stage !== 'REGISTRATION' && current.stage !== 'EXAM') {
                if (current.startsAt && new Date(current.startsAt).getTime() < nextStart.getTime()) {
                    newEndsAt = nextStart;
                }
            }

            if (newEndsAt && (!current.endsAt || current.endsAt.getTime() !== newEndsAt.getTime())) {
                await prisma.lifecycleEvent.update({
                    where: { id: current.id },
                    data: { endsAt: newEndsAt },
                });
                current.endsAt = newEndsAt;
                eventsUpdatedCount++;
            }
        }

        // Check single day EXAM
        const examEv = sorted.find((e) => e.stage === 'EXAM');
        if (examEv?.startsAt && (!examEv.endsAt || examEv.endsAt.getTime() === new Date(examEv.startsAt).getTime())) {
            const singleDayEnd = new Date(examEv.startsAt);
            singleDayEnd.setUTCHours(23, 59, 59, 999);
            await prisma.lifecycleEvent.update({
                where: { id: examEv.id },
                data: { endsAt: singleDayEnd },
            });
            examEv.endsAt = singleDayEnd;
            eventsUpdatedCount++;
        }

        const correctStatus = ExamStatusResolver.resolveStatus(sorted, now);

        if (correctStatus !== exam.status) {
            await prisma.exam.update({
                where: { id: exam.id },
                data: {
                    status: correctStatus,
                    updatedAt: new Date(),
                },
            });

            const changeKey = `${exam.status} -> ${correctStatus}`;
            statusChanges[changeKey] = (statusChanges[changeKey] || 0) + 1;
            updatedCount++;
            logger.info(`Updated [${exam.title}] (${exam.slug}): ${changeKey}`);
        }
    }

    logger.info(`Status synchronization complete: ${updatedCount} exams updated, ${eventsUpdatedCount} lifecycle events chained.`);
    console.log('Status change breakdown:', JSON.stringify(statusChanges, null, 2));

    // Recalculate Trending Exams
    logger.info('Recalculating trending scores...');
    const trendingSummary = await TrendingService.syncTrendingExams(12);
    logger.info(`Trending sync finished: ${trendingSummary.trendingCount} exams trending.`);
    console.log('Active Trending Exams:', JSON.stringify(trendingSummary.activeTrendingExams, null, 2));

    // Invalidate Redis Caches
    try {
        await cacheService.del('home:trending:5');
        await cacheService.del('home:trending:6');
        await cacheService.del('home:trending:10');
        await cacheService.del('home:trending:12');
        await cacheService.del('home:ticker:6');
        await cacheService.del('home:ticker:10');
        logger.info('Redis home caches cleared successfully.');
    } catch (e) {
        logger.warn('Could not clear redis cache (may be offline):', e);
    }
}

main()
    .catch((err) => {
        console.error('Failed to sync statuses:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
