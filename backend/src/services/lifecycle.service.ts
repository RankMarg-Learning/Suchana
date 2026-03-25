import prisma from '../config/database';
import { cacheService } from '../utils/cache';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { notificationQueue } from '../queues/notification.queue';
import { getStatusFromStage } from '../constants/enums';
import type {
    CreateLifecycleEventDto,
    UpdateLifecycleEventDto,
} from '../schemas/lifecycle.schema';
import { logger } from '../utils/logger';
import { SeoService } from './seo.service';

const TTL = env.CACHE_TTL_TIMELINE;
const key = (id: string) => `timeline:${id}`;

/**
 * Optimized Timeline Retrieval
 */
export async function getExamTimeline(examIdOrSlug: string) {
    const exam = await prisma.exam.findFirst({
        where: {
            OR: [
                { id: examIdOrSlug },
                { slug: examIdOrSlug }
            ]
        },
        select: { id: true, title: true, shortTitle: true, slug: true, status: true },
    });
    if (!exam) throw new AppError(404, 'EXAM_NOT_FOUND', `Exam ${examIdOrSlug} not found`);

    return cacheService.getOrSet(key(exam.id), TTL, async () => {
        const events = await prisma.lifecycleEvent.findMany({
            where: { examId: exam.id },
            orderBy: { startsAt: 'asc' },
        });
        return { exam, events };
    });
}

/**
 * Add Event with Auto-Notification Trigger
 */
export async function addLifecycleEvent(examId: string, dto: CreateLifecycleEventDto, adminId: string) {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new AppError(404, 'EXAM_NOT_FOUND', `Exam ${examId} not found`);

    const event = await prisma.lifecycleEvent.create({
        data: {
            ...dto,
            examId,
            createdBy: adminId,
            startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
            endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        },
    });

    // Cache Invalidation
    await Promise.all([
        cacheService.del(key(examId)),
        cacheService.delPattern('exams:list:*'),
        cacheService.del(`exams:detail:${examId}`)
    ]);

    // Background Queueing
    if (!event.isTBD && event.startsAt) {
        await notificationQueue.enqueueLifecycleNotification({
            lifecycleEventId: event.id,
            examTitle: exam.shortTitle,
            eventTitle: event.title,
            stage: event.stage,
            startsAt: event.startsAt,
        });
    }

    // Auto-update Exam status if stage matches
    const newStatus = getStatusFromStage(event.stage);
    if (newStatus && exam.status !== newStatus) {
        await prisma.exam.update({
            where: { id: examId },
            data: { status: newStatus },
        });
        logger.info(`Exam ${examId} status auto-updated to ${newStatus} due to event ${event.id}`);
    }

    logger.info(`Event ${event.id} registered for exam ${examId}`);

    if (exam.isPublished) {
        SeoService.generateExamSeoPages(examId).catch(e => logger.error(`[SEO] Async refresh failed for ${examId}`, e));
    }

    return event;
}

export async function updateLifecycleEvent(examId: string, eventId: string, dto: UpdateLifecycleEventDto, adminId: string) {
    const existing = await prisma.lifecycleEvent.findFirst({ where: { id: eventId, examId } });
    if (!existing) throw new AppError(404, 'EVENT_NOT_FOUND', `Event ${eventId} not found`);

    const updated = await prisma.lifecycleEvent.update({
        where: { id: eventId },
        data: {
            ...dto,
            updatedAt: new Date(),
            startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
            endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        },
    });

    await cacheService.del(key(examId));

    // If dates changed, re-sync job
    if (updated.startsAt?.getTime() !== existing.startsAt?.getTime() && !updated.isTBD && updated.startsAt) {
        const exam = await prisma.exam.findUnique({ where: { id: examId } });
        if (exam) {
            await notificationQueue.enqueueLifecycleNotification({
                lifecycleEventId: updated.id,
                examTitle: exam.shortTitle,
                eventTitle: updated.title,
                stage: updated.stage,
                startsAt: updated.startsAt,
            });
        }
    }

    // Auto-update Exam status if stage/type changed
    const newStatus = getStatusFromStage(updated.stage);
    if (newStatus) {
        await prisma.exam.update({
            where: { id: examId },
            data: { status: newStatus },
        });
        logger.info(`Exam ${examId} status auto-updated to ${newStatus} due to updated event ${eventId}`);
    }

    // Refresh SEO pages
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (exam?.isPublished) {
        SeoService.generateExamSeoPages(examId).catch(e => logger.error(`[SEO] Async refresh failed for ${examId}`, e));
    }

    return updated;
}

export async function deleteLifecycleEvent(examId: string, eventId: string, _adminId?: string) {
    const existing = await prisma.lifecycleEvent.findFirst({ where: { id: eventId, examId } });
    if (!existing) throw new AppError(404, 'EVENT_NOT_FOUND', `Event ${eventId} not found`);

    await prisma.lifecycleEvent.delete({ where: { id: eventId } });
    await Promise.all([
        notificationQueue.removeJob(eventId),
        cacheService.del(key(examId))
    ]);

    logger.info(`Event ${eventId} purged`);

    // Refresh SEO pages (as a stage might have been removed)
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (exam?.isPublished) {
        SeoService.generateExamSeoPages(examId).catch(e => logger.error(`[SEO] Async refresh failed for ${examId}`, e));
    }
}

/**
 * For periodic safety checks (Job Scheduler)
 */
export async function getUpcomingNotifiableEvents(leadTimeHours: number) {
    const cutoff = new Date(Date.now() + leadTimeHours * 3600000);

    return prisma.lifecycleEvent.findMany({
        where: {
            notificationSent: false,
            isTBD: false,
            startsAt: { lte: cutoff, gte: new Date() },
        },
        include: { exam: { select: { shortTitle: true } } },
        orderBy: { startsAt: 'asc' },
    });
}

export async function getAllEvents(params?: any) {
    return prisma.lifecycleEvent.findMany({
        where: {
            startsAt: { gte: params?.from || new Date() },
        },
        include: {
            exam: {
                select: { id: true, title: true, shortTitle: true, slug: true }
            }
        },
        orderBy: { startsAt: 'asc' },
        take: 100
    });
}
