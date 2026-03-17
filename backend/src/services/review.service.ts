// ============================================================
// src/services/review.service.ts
// Admin review pipeline: list/get staged exams, approve/reject/flag
// ============================================================
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ReviewStatus } from '../constants/enums';
import { logger } from '../utils/logger';
import { slugify } from '../utils/slugify';
import type {
    ListStagedExamQuery,
    ReviewDecisionDto,
} from '../schemas/scraper.schema';

// ─── List staged exams ────────────────────────────────────────
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

// ─── Get single staged exam ───────────────────────────────────
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

// ─── Review decision ──────────────────────────────────────────
export async function reviewStagedExam(
    id: string,
    dto: ReviewDecisionDto,
    adminId: string,
): Promise<{ stagedExam: unknown; examId?: string }> {
    const staged = await prisma.stagedExam.findUnique({ where: { id } });
    if (!staged) throw new AppError(404, 'NOT_FOUND', `StagedExam ${id} not found`);

    if (staged.reviewStatus === ReviewStatus.APPROVED) {
        throw new AppError(409, 'ALREADY_APPROVED', `StagedExam ${id} is already approved`);
    }

    // Merge any edits from admin into the staged exam
    const updatedStaged = await prisma.stagedExam.update({
        where: { id },
        data: {
            reviewStatus: dto.decision,
            reviewNote: dto.reviewNote,
            reviewedBy: adminId,
            reviewedAt: new Date(),
            // Allow admin to correct fields before approval
            ...(dto.corrections?.title && { title: dto.corrections.title }),
            ...(dto.corrections?.shortTitle && { shortTitle: dto.corrections.shortTitle }),
            ...(dto.corrections?.conductingBody && { conductingBody: dto.corrections.conductingBody }),
            ...(dto.corrections?.category && { category: dto.corrections.category }),
            ...(dto.corrections?.examLevel && { examLevel: dto.corrections.examLevel }),
            ...(dto.corrections?.totalVacancies !== undefined && {
                totalVacancies: dto.corrections.totalVacancies,
            }),
            ...(dto.corrections?.description && { description: dto.corrections.description }),
            ...(dto.corrections?.officialWebsite && { officialWebsite: dto.corrections.officialWebsite }),
            ...(dto.corrections?.notificationUrl && { notificationUrl: dto.corrections.notificationUrl }),
        },
    });

    logger.info(
        `[Review] StagedExam ${id} → ${dto.decision} by admin ${adminId}. Note: ${dto.reviewNote ?? 'none'}`,
    );

    // If APPROVED → promote to Exam table
    if (dto.decision === ReviewStatus.APPROVED) {
        // Ensure reviewStatus is updated first
        await prisma.stagedExam.update({
            where: { id },
            data: { reviewStatus: ReviewStatus.APPROVED },
        });

        const { examId } = await promoteStagedExam(id, adminId);
        logger.info(`[Review] StagedExam ${id} promoted to Exam ${examId}`);
        return { stagedExam: updatedStaged, examId };
    }

    return { stagedExam: updatedStaged };
}

// ─── Update staged lifecycle event ───────────────────────────
export async function updateStagedEvent(
    stagedExamId: string,
    eventId: string,
    data: {
        stage?: string;
        eventType?: string;
        title?: string;
        description?: string;
        startsAt?: Date | null;
        endsAt?: Date | null;
        isTBD?: boolean;
        isImportant?: boolean;
        actionUrl?: string | null;
        actionLabel?: string | null;
    },
) {
    const event = await prisma.stagedLifecycleEvent.findFirst({
        where: { id: eventId, stagedExamId },
    });
    if (!event) throw new AppError(404, 'NOT_FOUND', `StagedLifecycleEvent ${eventId} not found`);

    return prisma.stagedLifecycleEvent.update({
        where: { id: eventId },
        data: data as never,
    });
}

// ─── Delete staged lifecycle event ───────────────────────────
export async function deleteStagedEvent(stagedExamId: string, eventId: string) {
    const event = await prisma.stagedLifecycleEvent.findFirst({
        where: { id: eventId, stagedExamId },
    });
    if (!event) throw new AppError(404, 'NOT_FOUND', `StagedLifecycleEvent ${eventId} not found`);
    await prisma.stagedLifecycleEvent.delete({ where: { id: eventId } });
}

// ─── Stats for admin dashboard ────────────────────────────────
export async function getReviewStats() {
    const [pendingCount, approvedCount, rejectedCount, needsCorrectionCount, duplicateCount, totalJobs] =
        await Promise.all([
            prisma.stagedExam.count({ where: { reviewStatus: ReviewStatus.PENDING, isDuplicate: false } }),
            prisma.stagedExam.count({ where: { reviewStatus: ReviewStatus.APPROVED } }),
            prisma.stagedExam.count({ where: { reviewStatus: ReviewStatus.REJECTED } }),
            prisma.stagedExam.count({ where: { reviewStatus: ReviewStatus.NEEDS_CORRECTION } }),
            prisma.stagedExam.count({ where: { isDuplicate: true } }),
            prisma.scrapeJob.count(),
        ]);

    const recentJobs = await prisma.scrapeJob.findMany({
        orderBy: { startedAt: 'desc' },
        take: 5,
        include: {
            scrapeSource: { select: { label: true } },
        },
    });

    return {
        reviewQueue: {
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
            needsCorrection: needsCorrectionCount,
            duplicates: duplicateCount,
        },
        totalJobs,
        recentJobs,
    };
}
// ─── Promote staged exam to production ───────────────────────────
export async function promoteStagedExam(stagedExamId: string, adminId: string): Promise<{ examId: string }> {
    const staged = await prisma.stagedExam.findUnique({
        where: { id: stagedExamId },
        include: { stagedEvents: { orderBy: { stageOrder: 'asc' } } },
    });

    if (!staged) throw new AppError(404, 'NOT_FOUND', `StagedExam ${stagedExamId} not found`);
    if (staged.reviewStatus !== 'APPROVED') throw new AppError(400, 'BAD_REQUEST', `StagedExam ${stagedExamId} is not APPROVED`);

    async function buildUniqueSlug(base: string): Promise<string> {
        const baseSlug = slugify(base).slice(0, 100);

        let candidate = baseSlug;
        let counter = 1;
        while (await prisma.exam.findUnique({ where: { slug: candidate } })) {
            candidate = `${baseSlug}-${counter++}`;
        }
        return candidate;
    }

    const totalVacanciesJson = staged.totalVacancies ?? undefined;

    let deduplicationKey: string | undefined = staged.deduplicationKey ?? undefined;
    if (deduplicationKey) {
        const clash = await prisma.exam.findUnique({ where: { deduplicationKey } });
        if (clash && clash.id !== staged.existingExamId) {
            deduplicationKey = `${deduplicationKey}-${stagedExamId.slice(-6)}`;
        }
    }

    const eventRows = staged.stagedEvents.map((ev) => ({
        stage: ev.stage,
        eventType: ev.eventType,
        stageOrder: ev.stageOrder,
        title: ev.title,
        description: ev.description ?? undefined,
        startsAt: ev.startsAt ?? undefined,
        endsAt: ev.endsAt ?? undefined,
        isTBD: ev.isTBD,
        isImportant: ev.isImportant,
        actionUrl: ev.actionUrl ?? undefined,
        actionLabel: ev.actionLabel ?? undefined,
        sourceStagedEventId: ev.id,
        createdBy: adminId,
    }));

    if (staged.existingExamId) {
        const existing = await prisma.exam.findUnique({ where: { id: staged.existingExamId } });
        if (!existing) throw new AppError(404, 'NOT_FOUND', `Linked exam ${staged.existingExamId} no longer exists`);

        await prisma.$transaction(async (tx) => {
            await tx.exam.update({
                where: { id: staged.existingExamId! },
                data: {
                    title: staged.title,
                    shortTitle: staged.shortTitle ?? staged.title,
                    description: staged.description ?? existing.description,
                    conductingBody: staged.conductingBody ?? existing.conductingBody,
                    category: staged.category ?? existing.category,
                    examLevel: staged.examLevel ?? existing.examLevel,
                    state: staged.state ?? existing.state,
                    minAge: staged.minAge ?? existing.minAge,
                    maxAge: staged.maxAge ?? existing.maxAge,
                    qualificationCriteria: (staged.qualificationCriteria ?? existing.qualificationCriteria) as never,
                    totalVacancies: (totalVacanciesJson ?? existing.totalVacancies) as never,
                    applicationFee: (staged.applicationFee ?? existing.applicationFee) as never,
                    officialWebsite: staged.officialWebsite ?? existing.officialWebsite,
                    notificationUrl: staged.notificationUrl ?? existing.notificationUrl,
                    sourceStagedExamId: staged.id,
                    status: 'ACTIVE',
                    isPublished: true,
                    publishedAt: existing.publishedAt ?? new Date(),
                    updatedAt: new Date(),
                },
            });

            await tx.lifecycleEvent.deleteMany({ where: { examId: staged.existingExamId! } });

            if (eventRows.length > 0) {
                await tx.lifecycleEvent.createMany({ data: eventRows.map(r => ({ ...r, examId: staged.existingExamId! })) });
            }

            await tx.stagedExam.update({
                where: { id: stagedExamId },
                data: { existingExamId: staged.existingExamId },
            });
        });

        logger.info(`[Promote] Updated existing Exam ${staged.existingExamId} from StagedExam ${stagedExamId}`);
        return { examId: staged.existingExamId };
    }

    const baseSlug = staged.slug ?? staged.title;
    const finalSlug = await buildUniqueSlug(baseSlug);

    const { examId } = await prisma.$transaction(async (tx) => {
        const exam = await tx.exam.create({
            data: {
                title: staged.title,
                shortTitle: staged.shortTitle ?? staged.title,
                slug: finalSlug,
                description: staged.description ?? undefined,
                conductingBody: staged.conductingBody ?? 'Unknown',
                category: staged.category ?? 'OTHER',
                examLevel: staged.examLevel ?? 'NATIONAL',
                state: staged.state ?? undefined,
                minAge: staged.minAge ?? undefined,
                maxAge: staged.maxAge ?? undefined,
                qualificationCriteria: staged.qualificationCriteria as never ?? undefined,
                totalVacancies: totalVacanciesJson as never ?? undefined,
                applicationFee: staged.applicationFee as never ?? undefined,
                officialWebsite: staged.officialWebsite ?? undefined,
                notificationUrl: staged.notificationUrl ?? undefined,
                deduplicationKey: deduplicationKey ?? undefined,
                sourceStagedExamId: staged.id,
                createdBy: adminId,
                status: 'ACTIVE',
                isPublished: true,
                publishedAt: new Date(),
                lifecycleEvents: eventRows.length > 0 ? { create: eventRows } : undefined,
            },
        });
        return { examId: exam.id };
    });

    logger.info(`[Promote] Created new Exam ${examId} from StagedExam ${stagedExamId} · slug="${finalSlug}" · events=${eventRows.length}`);
    return { examId };
}
