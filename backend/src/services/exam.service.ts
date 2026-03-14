import { Prisma } from '@prisma/client';
import { ExamCategory, ExamStatus, ExamLevel } from '../constants/enums';
import prisma from '../config/database';
import { cacheService } from '../utils/cache';
import { slugify, uniqueSlug } from '../utils/slugify';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import type { CreateExamDto, UpdateExamDto, ListExamQuery } from '../schemas/exam.schema';
import { logger } from '../utils/logger';

const EXAM_LIST_CACHE_KEY = 'exams:list';
const EXAM_DETAIL_CACHE_KEY = (id: string) => `exams:detail:${id}`;

export async function listExams(query: ListExamQuery) {
    const { page, limit, category, status, conductingBody, search, isPublished, examLevel, state, lifecycleStage } = query;
    const cacheKey = `${EXAM_LIST_CACHE_KEY}:${JSON.stringify(query)}`;

    return cacheService.getOrSet(cacheKey, env.CACHE_TTL_EXAM_LIST, async () => {
        const where: Prisma.ExamWhereInput = {
            ...(category && { category }),
            ...(status && { status }),
            ...(conductingBody && {
                conductingBody: { contains: conductingBody, mode: 'insensitive' },
            }),
            ...(isPublished !== undefined && { isPublished }),
            ...(examLevel && { examLevel }),
            ...(state && { state: { contains: state, mode: 'insensitive' } }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { shortTitle: { contains: search, mode: 'insensitive' } },
                    { conductingBody: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(lifecycleStage && {
                lifecycleEvents: {
                    some: {
                        stage: lifecycleStage,
                        OR: [
                            { endsAt: { gte: new Date() } },
                            { endsAt: null },
                            { startsAt: { gte: new Date() } }
                        ]
                    }
                }
            })
        };

        const [exams, total] = await Promise.all([
            prisma.exam.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [
                    { isPublished: 'desc' },
                    { publishedAt: 'desc' },
                    { updatedAt: 'desc' },
                ],
                select: {
                    id: true,
                    title: true,
                    shortTitle: true,
                    slug: true,
                    category: true,
                    conductingBody: true,
                    status: true,
                    examLevel: true,
                    state: true,
                    totalVacancies: true,
                    isPublished: true,
                    publishedAt: true,
                    updatedAt: true,
                    createdAt: true,
                    _count: { select: { lifecycleEvents: true } },
                    lifecycleEvents: {
                        where: { eventType: 'REGISTRATION' },
                        orderBy: { endsAt: 'asc' },
                        take: 1,
                        select: {
                            id: true,
                            title: true,
                            eventType: true,
                            startsAt: true,
                            endsAt: true,
                        }
                    },
                },
            }),
            prisma.exam.count({ where }),
        ]);

        return { exams, total };
    });
}

// ─── Get By ID ───────────────────────────────────────────────
export async function getExamById(id: string) {
    return cacheService.getOrSet(EXAM_DETAIL_CACHE_KEY(id), env.CACHE_TTL_EXAM_DETAIL, async () => {
        const exam = await prisma.exam.findUnique({
            where: { id },
            include: {
                lifecycleEvents: {
                    orderBy: { startsAt: 'asc' },
                },
            },
        });

        if (!exam) throw new AppError(404, 'EXAM_NOT_FOUND', `Exam with ID "${id}" not found`);
        return exam;
    });
}

// ─── Get By Slug ─────────────────────────────────────────────
export async function getExamBySlug(slug: string) {
    const cacheKey = `exams:slug:${slug}`;
    return cacheService.getOrSet(cacheKey, env.CACHE_TTL_EXAM_DETAIL, async () => {
        const exam = await prisma.exam.findUnique({
            where: { slug },
            include: {
                lifecycleEvents: { orderBy: { startsAt: 'asc' } },
            },
        });
        if (!exam) throw new AppError(404, 'EXAM_NOT_FOUND', `Exam "${slug}" not found`);
        return exam;
    });
}

// ─── Create ──────────────────────────────────────────────────
export async function createExam(dto: CreateExamDto, adminId: string) {
    // Generate a unique slug from title
    const baseSlug = slugify(dto.title);
    const slugExists = await prisma.exam.findUnique({ where: { slug: baseSlug } });
    const slug = slugExists ? uniqueSlug(dto.title) : baseSlug;

    const exam = await prisma.exam.create({
        data: {
            ...dto,
            qualificationCriteria: dto.qualificationCriteria as Prisma.InputJsonValue,
            applicationFee: dto.applicationFee as Prisma.InputJsonValue,
            totalVacancies: dto.totalVacancies as Prisma.InputJsonValue,
            slug,
            createdBy: adminId,
            publishedAt: dto.isPublished ? new Date() : null,
        },
    });


    // Invalidate list cache
    await cacheService.delPattern('exams:list:*');
    logger.info(`Exam created: ${exam.id} by admin ${adminId}`);

    return exam;
}

export async function updateExam(id: string, dto: UpdateExamDto, adminId: string) {
    const existing = await prisma.exam.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'EXAM_NOT_FOUND', `Exam "${id}" not found`);

    const data: Prisma.ExamUpdateInput = {
        ...dto,
        qualificationCriteria: dto.qualificationCriteria as Prisma.InputJsonValue,
        applicationFee: dto.applicationFee as Prisma.InputJsonValue,
        totalVacancies: dto.totalVacancies as Prisma.InputJsonValue,
        // Auto-set publishedAt when first publish
        ...(dto.isPublished && !existing.isPublished && { publishedAt: new Date() }),
    };

    const updated = await prisma.exam.update({ where: { id }, data });


    await Promise.all([
        cacheService.del(EXAM_DETAIL_CACHE_KEY(id)),
        cacheService.del(`exams: slug:${existing.slug} `),
        cacheService.delPattern('exams:list:*'),
    ]);

    return updated;
}

// ─── Delete ──────────────────────────────────────────────────
export async function deleteExam(id: string, adminId: string) {
    const existing = await prisma.exam.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'EXAM_NOT_FOUND', `Exam "${id}" not found`);

    await prisma.exam.delete({ where: { id } });


    await Promise.all([
        cacheService.del(EXAM_DETAIL_CACHE_KEY(id)),
        cacheService.del(`exams: slug:${existing.slug} `),
        cacheService.delPattern('exams:list:*'),
    ]);
    logger.info(`Exam deleted: ${id} by admin ${adminId} `);
}

// ─── Get Saved Exams ─────────────────────────────────────────
export async function getSavedExams(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { savedExamIds: true }
    });

    if (!user) throw new AppError(404, 'USER_NOT_FOUND', `User with ID "${userId}" not found`);

    const exams = await prisma.exam.findMany({
        where: {
            id: { in: user.savedExamIds },
            isPublished: true
        },
        select: {
            id: true,
            title: true,
            shortTitle: true,
            slug: true,
            category: true,
            conductingBody: true,
            status: true,
            examLevel: true,
            state: true,
            totalVacancies: true,
            isPublished: true,
            publishedAt: true,
            createdAt: true,
            _count: { select: { lifecycleEvents: true } },
            lifecycleEvents: {
                where: { eventType: 'REGISTRATION' },
                orderBy: { endsAt: 'asc' },
                take: 1,
                select: {
                    id: true,
                    title: true,
                    eventType: true,
                    startsAt: true,
                    endsAt: true,
                }
            },
        }
    });

    return exams;
}

logger.info(`Exam service loaded`);
