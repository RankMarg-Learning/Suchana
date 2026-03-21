import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export async function updateStagedEvent(
    stagedExamId: string,
    eventId: string,
    data: {
        stage?: string;
        title?: string;
        description?: string;
        startsAt?: Date | null;
        endsAt?: Date | null;
        isTBD?: boolean;
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

export async function deleteStagedEvent(stagedExamId: string, eventId: string) {
    const event = await prisma.stagedLifecycleEvent.findFirst({
        where: { id: eventId, stagedExamId },
    });
    if (!event) throw new AppError(404, 'NOT_FOUND', `StagedLifecycleEvent ${eventId} not found`);
    await prisma.stagedLifecycleEvent.delete({ where: { id: eventId } });
}

export async function addStagedEvent(
    stagedExamId: string,
    data: {
        stage: string;
        title: string;
        description?: string;
        startsAt?: Date | null;
        endsAt?: Date | null;
        isTBD?: boolean;
        actionUrl?: string | null;
        actionLabel?: string | null;
        stageOrder?: number;
    },
) {
    const exam = await prisma.stagedExam.findUnique({ where: { id: stagedExamId } });
    if (!exam) throw new AppError(404, 'NOT_FOUND', `StagedExam ${stagedExamId} not found`);

    return prisma.stagedLifecycleEvent.create({
        data: {
            ...data,
            stagedExamId,
        } as any,
    });
}
