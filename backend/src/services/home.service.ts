import prisma from '../config/database';
import { cacheService } from '../utils/cache';

export const getTrendingExams = async (limit: number) => {
    return cacheService.getOrSet(`home:trending:${limit}`, 900, async () => {
        return prisma.exam.findMany({
            where: { isPublished: true, isTrending: true },
            take: limit,
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true, 
                title: true, 
                shortTitle: true, 
                slug: true,
                conductingBody: true, 
                status: true,
                lifecycleEvents: {
                    orderBy: { stageOrder: 'asc' },
                    take: 6,
                    select: { 
                        stage: true, 
                        title: true, 
                        isTBD: true, 
                        startsAt: true, 
                        endsAt: true 
                    }
                }
            }
        });
    });
};

export const getTickerExams = async (limit: number) => {
    return cacheService.getOrSet(`home:ticker:${limit}`, 900, async () => {
        return prisma.exam.findMany({
            where: { isPublished: true, isTrending: true },
            take: limit,
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true, 
                title: true, 
                slug: true,
                status: true,
            }
        });
    });
};

export const getNews = async (limit: number, page: number) => {
    const skip = (page - 1) * limit;
    return cacheService.getOrSet(`home:news:${limit}:${page}`, 600, async () => {
        return prisma.seoPage.findMany({
            where: { isPublished: true, isTrending: true },
            select: {
                title: true,
                slug: true,
                category: true,
                exam: { select: { conductingBody: true } },
                updatedAt: true,
            },
            take: limit,
            skip,
            orderBy: { updatedAt: 'desc' },
        });
    });
};

export const getPreviousYearPapers = async (limit: number) => {
    return cacheService.getOrSet(`home:pyq:${limit}`, 3600, async () => {
        return prisma.seoPage.findMany({
            where: { isPublished: true, category: 'PREVIOUS_YEAR_PAPERS' },
            take: limit,
            orderBy: { updatedAt: 'desc' },
            include: { exam: { select: { conductingBody: true } } }
        });
    });
};

export const getArticles = async (limit: number, page: number) => {
    const skip = (page - 1) * limit;
    // return cacheService.getOrSet(`home:articles:${limit}:${page}`, 3600, async () => {
    return prisma.seoPage.findMany({
        where: { isPublished: true, },
        take: limit,
        skip,
        orderBy: { updatedAt: 'desc' },
        include: { exam: { select: { conductingBody: true } } }
    });
    // });
};



export const getClosingSoon = async (limit: number) => {
    return cacheService.getOrSet(`home:closing-soon:${limit}`, 300, async () => {
        const now = new Date();
        return prisma.lifecycleEvent.findMany({
            where: {
                endsAt: { gt: now },
                exam: { isPublished: true }
            },
            take: limit,
            orderBy: { endsAt: 'asc' },
            include: {
                exam: {
                    select: { slug: true, title: true, status: true }
                }
            }
        });
    });
};
