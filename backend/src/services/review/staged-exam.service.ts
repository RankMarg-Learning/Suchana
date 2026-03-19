import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import type { ListStagedExamQuery } from '../../schemas/scraper.schema';

export async function listStagedExams(query: ListStagedExamQuery) {
    const { page = 1, limit = 20, reviewStatus, isDuplicate, category, scrapeJobId } = query;

    const where = {
        ...(reviewStatus && { reviewStatus }),
        ...(isDuplicate !== undefined && { isDuplicate }),
        ...(category && { category }),
        ...(scrapeJobId && { scrapeJobId }),
    };

    const [staged, total] = await Promise.all([
        prisma.stagedExam.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                stagedEvents: { orderBy: { stageOrder: 'asc' } },
                scrapeJob: {
                    select: {
                        id: true,
                        status: true,
                        scrapeSource: { select: { label: true, url: true } },
                    },
                },
            },
        }),
        prisma.stagedExam.count({ where }),
    ]);

    return { staged, total };
}

export async function getStagedExamById(id: string) {
    const staged = await prisma.stagedExam.findUnique({
        where: { id },
        include: {
            stagedEvents: { orderBy: { stageOrder: 'asc' } },
            scrapeJob: {
                include: {
                    scrapeSource: true,
                },
            },
        },
    });
    if (!staged) throw new AppError(404, 'NOT_FOUND', `StagedExam ${id} not found`);
    return staged;
}
