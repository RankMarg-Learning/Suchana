import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import type {
    CreateScrapeSourceDto,
    UpdateScrapeSourceDto,
    ListScrapeSourceQuery,
} from '../schemas/scraper.schema';

export async function listScrapeSources(query: ListScrapeSourceQuery) {
    const { page = 1, limit = 20, isActive, sourceType } = query;

    const where = {
        ...(isActive !== undefined && { isActive }),
        ...(sourceType && { sourceType }),
    };

    const [sources, total] = await Promise.all([
        prisma.scrapeSource.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { scrapeJobs: true } },
                scrapeJobs: {
                    orderBy: { startedAt: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        status: true,
                        candidatesFound: true,
                        startedAt: true,
                        completedAt: true,
                    },
                },
            },
        }),
        prisma.scrapeSource.count({ where }),
    ]);

    return { sources, total };
}

export async function getScrapeSourceById(id: string) {
    const source = await prisma.scrapeSource.findUnique({
        where: { id },
        include: {
            scrapeJobs: {
                orderBy: { startedAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    status: true,
                    candidatesFound: true,
                    startedAt: true,
                    completedAt: true,
                    errorMessage: true,
                    rawPayload: true,
                },
            },
        },
    });
    if (!source) throw new AppError(404, 'NOT_FOUND', `ScrapeSource ${id} not found`);
    return source;
}

export async function createScrapeSource(dto: CreateScrapeSourceDto) {
    const existing = await prisma.scrapeSource.findUnique({ where: { url: dto.url } });
    if (existing) throw new AppError(409, 'CONFLICT', `URL already registered: ${dto.url}`);

    const source = await prisma.scrapeSource.create({ data: dto as never });
    logger.info(`[ScrapeSource] Created: ${source.id} — ${source.url}`);
    return source;
}

export async function updateScrapeSource(id: string, dto: UpdateScrapeSourceDto) {
    const existing = await prisma.scrapeSource.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', `ScrapeSource ${id} not found`);

    const updated = await prisma.scrapeSource.update({
        where: { id },
        data: dto as never,
    });
    return updated;
}

export async function deleteScrapeSource(id: string) {
    const existing = await prisma.scrapeSource.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', `ScrapeSource ${id} not found`);
    await prisma.scrapeSource.delete({ where: { id } });
}

export async function listScrapeJobs(sourceId?: string, limit = 50) {
    return prisma.scrapeJob.findMany({
        where: sourceId ? { scrapeSourceId: sourceId } : undefined,
        orderBy: { startedAt: 'desc' },
        take: limit,
        include: {
            scrapeSource: { select: { id: true, label: true, url: true } },
            _count: { select: { stagedExams: true } },
        },
    });
}

export async function getScrapeJobById(id: string) {
    const job = await prisma.scrapeJob.findUnique({
        where: { id },
        include: {
            scrapeSource: true,
            stagedExams: {
                include: { stagedEvents: true },
                orderBy: { createdAt: 'desc' },
            },
        },
    });
    if (!job) throw new AppError(404, 'NOT_FOUND', `ScrapeJob ${id} not found`);
    return job;
}
