import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { slugify } from '../../utils/slugify';
import { NotificationService } from '../notification.service';
import { notificationQueue } from '../../queues/notification.queue';
import { getStatusFromStage } from '../../constants/enums';
import { SeoService } from '../seo.service';

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
        stageOrder: ev.stageOrder,
        title: ev.title,
        description: ev.description ?? undefined,
        startsAt: ev.startsAt ?? undefined,
        endsAt: ev.endsAt ?? undefined,
        isTBD: ev.isTBD,
        actionUrl: ev.actionUrl ?? undefined,
        actionLabel: ev.actionLabel ?? undefined,
        sourceStagedEventId: ev.id,
        createdBy: adminId,
    }));

    // Derive Status from events
    let derivedStatus = 'ACTIVE';
    // Sort events by stageOrder descending to get the "latest" status
    const sortedForStatus = [...staged.stagedEvents].sort((a, b) => b.stageOrder - a.stageOrder);
    for (const ev of sortedForStatus) {
        const potential = getStatusFromStage(ev.stage);
        if (potential) {
            derivedStatus = potential;
            break;
        }
    }

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
                    age: staged.age ?? existing.age,
                    qualificationCriteria: staged.qualificationCriteria ?? existing.qualificationCriteria,
                    totalVacancies: totalVacanciesJson ?? existing.totalVacancies,
                    applicationFee: staged.applicationFee ?? existing.applicationFee,
                    salary: staged.salary ?? existing.salary,
                    additionalDetails: staged.additionalDetails ?? existing.additionalDetails,
                    officialWebsite: staged.officialWebsite ?? existing.officialWebsite,
                    notificationUrl: staged.notificationUrl ?? existing.notificationUrl,
                    sourceStagedExamId: staged.id,
                    status: derivedStatus,
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
        
        try {
            await SeoService.generateExamSeoPages(staged.existingExamId!);
        } catch (e) {
            logger.error(`Failed to auto-generate SEO pages for ${staged.existingExamId}:`, e);
        }

        try {
            await NotificationService.sendManualExamNotification(
                staged.existingExamId!,
                `📢 Update: ${staged.shortTitle || staged.title}`,
                `Important changes have been made to the ${staged.shortTitle || staged.title} timeline. Tap to view.`
            );
        } catch (e) {
            logger.error(`Failed to send update notification for ${staged.existingExamId}:`, e);
        }

        return { examId: staged.existingExamId! };
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
                age: staged.age ?? undefined,
                qualificationCriteria: staged.qualificationCriteria ?? undefined,
                totalVacancies: totalVacanciesJson ?? undefined,
                applicationFee: staged.applicationFee ?? undefined,
                salary: staged.salary ?? undefined,
                additionalDetails: staged.additionalDetails ?? undefined,
                officialWebsite: staged.officialWebsite ?? undefined,
                notificationUrl: staged.notificationUrl ?? undefined,
                deduplicationKey: deduplicationKey ?? undefined,
                sourceStagedExamId: staged.id,
                createdBy: adminId,
                status: derivedStatus,
                isPublished: true,
                publishedAt: new Date(),
                lifecycleEvents: eventRows.length > 0 ? { create: eventRows } : undefined,
            },
        });
        return { examId: exam.id };
    });

    try {
        await SeoService.generateExamSeoPages(examId);
    } catch (e) {
        logger.error(`Failed to auto-generate SEO pages for ${examId}:`, e);
    }

    try {
        await notificationQueue.enqueueNewExamNotification(examId);
    } catch (e) {
        logger.error(`Failed to queue new exam notification for ${examId}:`, e);
    }

    logger.info(`[Promote] Created new Exam ${examId} from StagedExam ${stagedExamId} · slug="${finalSlug}" · events=${eventRows.length}`);
    return { examId };
}
