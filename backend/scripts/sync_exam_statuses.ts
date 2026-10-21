import prisma from '../src/config/database';
import { ExamStatusResolver } from '../src/services/scraper/examStatusResolver';
import { TrendingService } from '../src/services/scraper/trending.service';
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
    const statusChanges: Record<string, number> = {};

    for (const exam of exams) {
        const correctStatus = ExamStatusResolver.resolveStatus(exam.lifecycleEvents, now);

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

    logger.info(`Status synchronization complete: ${updatedCount} exams updated.`);
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
