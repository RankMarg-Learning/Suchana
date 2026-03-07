// ============================================================
// src/services/lifecycle.service.ts  — Lifecycle event business logic
// ============================================================
import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { cacheService } from '../utils/cache';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { notificationQueue } from '../queues/notification.queue';
import { LifecycleEventType } from '../constants/enums';
import type {
    CreateLifecycleEventDto,
    UpdateLifecycleEventDto,
} from '../schemas/lifecycle.schema';
import { logger } from '../utils/logger';

const TIMELINE_CACHE_KEY = (examId: string) => `timeline:${examId}`;

export async function getExamTimeline(examId: string) {
    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        select: { id: true, title: true, shortTitle: true, slug: true, status: true },
    });
    if (!exam) throw new AppError(404, 'EXAM_NOT_FOUND', `Exam "${examId}" not found`);

    return cacheService.getOrSet(
        TIMELINE_CACHE_KEY(examId),
        env.CACHE_TTL_TIMELINE,
        async () => {
            const events = await prisma.lifecycleEvent.findMany({
                where: { examId },
                orderBy: { startsAt: 'asc' },
            });
            return { exam, events };
        }
    );
}

// ─── Add Lifecycle Event ─────────────────────────────────────
export async function addLifecycleEvent(
    examId: string,
    dto: CreateLifecycleEventDto,
    adminId: string
) {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new AppError(404, 'EXAM_NOT_FOUND', `Exam "${examId}" not found`);

    const event = await prisma.lifecycleEvent.create({
        data: {
            ...dto,
            examId,
            createdBy: adminId,
            startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
            endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        },
    });

    // Invalidate exam timeline cache
    await cacheService.del(TIMELINE_CACHE_KEY(examId));
    await cacheService.delPattern('exams:list:*');
    await cacheService.del(`exams:detail:${examId}`);

    // Queue notification job (only if not TBD)
    if (!event.isTBD && event.startsAt) {
        await notificationQueue.enqueueLifecycleNotification({
            lifecycleEventId: event.id,
            examTitle: exam.shortTitle,
            eventTitle: event.title,
            eventType: event.eventType as LifecycleEventType,
            startsAt: event.startsAt,
        });
    }

    logger.info(`Lifecycle event created: ${event.id} for exam ${examId}`);
    return event;
}

// ─── Update Lifecycle Event ──────────────────────────────────
export async function updateLifecycleEvent(
    examId: string,
    eventId: string,
    dto: UpdateLifecycleEventDto,
    adminId: string
) {
    const existing = await prisma.lifecycleEvent.findFirst({
        where: { id: eventId, examId },
    });
    if (!existing) {
        throw new AppError(404, 'EVENT_NOT_FOUND', `Lifecycle event "${eventId}" not found`);
    }

    const updated = await prisma.lifecycleEvent.update({
        where: { id: eventId },
        data: {
            ...dto,
            updatedAt: new Date(),
            startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
            endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        },
    });


    await cacheService.del(TIMELINE_CACHE_KEY(examId));

    // If dates changed, re-queue notification
    if (updated.startsAt !== existing.startsAt && !updated.isTBD && updated.startsAt) {
        // Enqueue will deduplicate via jobId
        const exam = await prisma.exam.findUnique({ where: { id: examId } });
        if (exam) {
            await notificationQueue.enqueueLifecycleNotification({
                lifecycleEventId: updated.id,
                examTitle: exam.shortTitle,
                eventTitle: updated.title,
                eventType: updated.eventType as LifecycleEventType,
                startsAt: updated.startsAt,
            });
        }
    }

    return updated;
}

// ─── Delete Lifecycle Event ──────────────────────────────────
export async function deleteLifecycleEvent(examId: string, eventId: string, adminId: string) {
    const existing = await prisma.lifecycleEvent.findFirst({
        where: { id: eventId, examId },
    });
    if (!existing) {
        throw new AppError(404, 'EVENT_NOT_FOUND', `Lifecycle event "${eventId}" not found`);
    }

    await prisma.lifecycleEvent.delete({ where: { id: eventId } });


    await notificationQueue.removeJob(eventId);
    await cacheService.del(TIMELINE_CACHE_KEY(examId));
    logger.info(`Lifecycle event deleted: ${eventId}`);
}

// ─── Get upcoming events (for worker polling) ────────────────
export async function getUpcomingNotifiableEvents(leadTimeHours: number) {
    const now = new Date();
    const cutoff = new Date(now.getTime() + leadTimeHours * 60 * 60 * 1000);

    return prisma.lifecycleEvent.findMany({
        where: {
            notificationSent: false,
            isTBD: false,
            startsAt: { lte: cutoff, not: null },
        },
        include: { exam: { select: { title: true, shortTitle: true, isPublished: true } } },
        orderBy: { startsAt: 'asc' },
    });
}
