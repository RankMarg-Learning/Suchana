import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { cacheService } from '../utils/cache';
import { slugify, uniqueSlug } from '../utils/slugify';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import type { CreateExamDto, UpdateExamDto, ListExamQuery } from '../schemas/exam.schema';
import { logger } from '../utils/logger';
import { SeoService } from './seo.service';

const EXAM_LIST_CACHE_KEY = 'exams:list';
const EXAM_DETAIL_CACHE_KEY = (id: string) => `exams:detail:${id}`;

export async function listExams(query: ListExamQuery, bypassCache = false) {
    const { page, limit, category, status, conductingBody, search, isPublished, examLevel, state, lifecycleStage, startDate, endDate } = query;
    const cacheKey = `${EXAM_LIST_CACHE_KEY}:${JSON.stringify(query)}`;

    const fetchExams = async () => {
        const statusFilter = status ? (status.includes(',') ? { in: status.split(',') as any } : status) : undefined;
        const where: Prisma.ExamWhereInput = {
            ...(category && { category }),
            ...(statusFilter && { status: statusFilter }),
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
            }),
            ...((startDate || endDate) && {
                createdAt: {
                    ...(startDate && { gte: new Date(startDate) }),
                    ...(endDate && { lte: new Date(endDate) }),
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
                    { updatedAt: 'desc' },
                    { publishedAt: 'desc' },
                ],
                select: {
                    id: true,
                    title: true,
                    shortTitle: true,
                    slug: true,
                    category: true,
                    conductingBody: true,
                    status: true,
                    isPublished: true,
                    publishedAt: true,
                    updatedAt: true,
                },
            }),
            prisma.exam.count({ where }),
        ]);


        return { exams, total };
    };

    if (bypassCache || search) {
        return fetchExams();
    }

    return cacheService.getOrSet(cacheKey, env.CACHE_TTL_EXAM_LIST, fetchExams);
}

// ─── Get By ID ───────────────────────────────────────────────
export async function getExamById(id: string, bypassCache = false) {
    const fetchExam = async () => {
        const exam = await prisma.exam.findUnique({
            where: { id },
            include: {
                lifecycleEvents: {
                    orderBy: { startsAt: 'asc' },
                },
                seoPages: {
                    where: { isPublished: true },
                    select: { slug: true, title: true }
                }
            },
        });

        if (!exam) throw new AppError(404, 'EXAM_NOT_FOUND', `Exam with ID "${id}" not found`);
        return exam;
    };

    if (bypassCache) return fetchExam();
    return cacheService.getOrSet(EXAM_DETAIL_CACHE_KEY(id), env.CACHE_TTL_EXAM_DETAIL, fetchExam);
}

// ─── Get By Slug ─────────────────────────────────────────────
export async function getExamBySlug(slug: string, bypassCache = false) {
    const fetchExam = async () => {
        const exam = await prisma.exam.findUnique({
            where: { slug },
            include: {
                lifecycleEvents: {
                    orderBy: { startsAt: 'asc' },
                },
                seoPages: {
                    where: { isPublished: true },
                    select: { slug: true, title: true }
                }
            },
        });

        if (!exam) throw new AppError(404, 'EXAM_NOT_FOUND', `Exam with slug "${slug}" not found`);
        return exam;
    };

    if (bypassCache) return fetchExam();
    return cacheService.getOrSet(`exams:slug:${slug}`, env.CACHE_TTL_EXAM_DETAIL, fetchExam);
}


export async function createExam(dto: CreateExamDto, adminId: string) {

    const fullTitle = dto.conductingBody && !dto.title.toLowerCase().includes(dto.conductingBody.toLowerCase())
        ? `${dto.conductingBody} ${dto.title}`
        : dto.title;

    const baseSlug = slugify(fullTitle);
    const slugExists = await prisma.exam.findUnique({ where: { slug: baseSlug } });
    const slug = slugExists ? uniqueSlug(fullTitle) : baseSlug;

    const exam = await prisma.exam.create({
        data: {
            ...dto,
            createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
            qualificationCriteria: dto.qualificationCriteria,
            applicationFee: dto.applicationFee,
            totalVacancies: dto.totalVacancies,
            salary: dto.salary,
            additionalDetails: dto.additionalDetails,
            slug,
            createdBy: adminId,
            publishedAt: dto.isPublished ? new Date() : null,
        },
    });


    await cacheService.delPattern('exams:list:*');

    logger.info(`Exam created: ${exam.id} by admin ${adminId}`);

    return exam;
}

export async function updateExam(id: string, dto: UpdateExamDto, adminId: string) {
    const existing = await prisma.exam.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'EXAM_NOT_FOUND', `Exam "${id}" not found`);

    const { createdAt, ...restDto } = dto;
    const data: Prisma.ExamUpdateInput = {
        ...restDto,
        ...(createdAt && { createdAt: new Date(createdAt) }),
        qualificationCriteria: dto.qualificationCriteria,
        applicationFee: dto.applicationFee,
        totalVacancies: dto.totalVacancies,
        salary: dto.salary,
        additionalDetails: dto.additionalDetails,
        // Auto-set publishedAt when first publish
        ...(dto.isPublished && !existing.isPublished && { publishedAt: new Date() }),
    };

    const updated = await prisma.exam.update({ where: { id }, data });

    await Promise.all([
        cacheService.del(EXAM_DETAIL_CACHE_KEY(id)),
        cacheService.del(`exams:slug:${existing.slug}`),
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
        cacheService.del(`exams:slug:${existing.slug}`),
        cacheService.delPattern('exams:list:*'),
    ]);
    logger.info(`Exam deleted: ${id} by admin ${adminId}`);
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
            createdAt: true
        }
    });
    return exams;
}

logger.info(`Exam service loaded`);
