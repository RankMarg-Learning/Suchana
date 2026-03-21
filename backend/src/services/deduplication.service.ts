import { createHash } from 'crypto';
import prisma from '../config/database';
import { slugify } from '../utils/slugify';
import { logger } from '../utils/logger';


export interface AiStructuredExam {
    title: string;
    shortTitle?: string;
    description?: string;
    conductingBody?: string;
    category?: string;
    examLevel?: string;
    state?: string;
    examYear?: number;
    age?: string;
    qualificationCriteria?: String;
    totalVacancies?: any;
    usefulLinks?: Record<string, string>;
    applicationFee?: string;
    officialWebsite?: string;
    notificationUrl?: string;
    aiConfidence?: number;
    aiNotes?: string;
    events?: AiStructuredEvent[];
    sourceUrl: string;
    scrapedAt: Date;
}

export interface AiStructuredEvent {
    stage: string;
    stageOrder?: number;
    title: string;
    description?: string;
    startsAt?: Date;
    endsAt?: Date;
    isTBD?: boolean;
    actionUrl?: string;
    actionLabel?: string;
}

export type DeduplicationResult =
    | { outcome: 'EXACT_DUPLICATE'; reason: string }
    | { outcome: 'MERGED_INTO_CANONICAL'; canonicalStagedExamId: string; sourceCount: number }
    | { outcome: 'LINKED_AS_UPDATE'; stagedExamId: string; existingExamId: string }
    | { outcome: 'NEW_STAGED'; stagedExamId: string };


function sha256(input: string): string {
    return createHash('sha256').update(input).digest('hex');
}

function normalise(value: string | undefined | null): string {
    return (value ?? '').toLowerCase().trim().replace(/\s+/g, ' ');
}


export function buildIdentityHash(
    conductingBody: string | undefined | null,
    examName: string,
    examYear: number | undefined | null,
): string {
    const parts = [
        normalise(conductingBody),
        normalise(examName),
        examYear != null ? String(examYear) : 'unknown',
    ];
    return sha256(parts.join('|'));
}


export function buildContentHash(exam: AiStructuredExam): string {
    const snapshot = {
        title: normalise(exam.title),
        conductingBody: normalise(exam.conductingBody),
        examYear: exam.examYear ?? null,
        totalVacancies: exam.totalVacancies ?? null,
        notificationUrl: normalise(exam.notificationUrl),
    };
    return sha256(JSON.stringify(snapshot));
}


export async function checkAndStage(
    scrapeJobId: string,
    exam: AiStructuredExam,
): Promise<DeduplicationResult> {
    const identityHash = buildIdentityHash(
        exam.conductingBody,
        exam.shortTitle ?? exam.title,
        exam.examYear,
    );
    const contentHash = buildContentHash(exam);

    logger.info(
        `[Dedup] source="${exam.sourceUrl}" ` +
        `identityHash="${identityHash.slice(0, 12)}..." ` +
        `contentHash="${contentHash.slice(0, 12)}..."`,
    );

    const exactMatch = await prisma.stagedExam.findFirst({
        where: { contentHash, isDuplicate: false },
        select: { id: true },
    });

    if (exactMatch) {
        logger.info(`[Dedup] L1 HIT — exact content match → StagedExam ${exactMatch.id}. Dropped.`);
        return {
            outcome: 'EXACT_DUPLICATE',
            reason: `Content hash matches existing StagedExam ${exactMatch.id}`,
        };
    }

    const pendingMatch = await prisma.stagedExam.findFirst({
        where: {
            deduplicationKey: identityHash,
            isDuplicate: false,
            reviewStatus: 'PENDING',
        },
        select: {
            id: true,
            sourceCount: true,
            mergedSourceUrls: true,
            aiConfidence: true,
        },
    });

    if (pendingMatch) {
        const higherConfidence =
            exam.aiConfidence !== undefined &&
            exam.aiConfidence > (pendingMatch.aiConfidence ?? 0);

        await prisma.stagedExam.update({
            where: { id: pendingMatch.id },
            data: {
                sourceCount: pendingMatch.sourceCount + 1,
                mergedSourceUrls: { push: exam.sourceUrl },
                ...(higherConfidence ? { aiConfidence: exam.aiConfidence } : {}),
            },
        });

        logger.info(
            `[Dedup] L2 HIT — merged into canonical StagedExam ${pendingMatch.id}. ` +
            `sourceCount=${pendingMatch.sourceCount + 1}`,
        );

        return {
            outcome: 'MERGED_INTO_CANONICAL',
            canonicalStagedExamId: pendingMatch.id,
            sourceCount: pendingMatch.sourceCount + 1,
        };
    }

    const approvedExam = await prisma.exam.findUnique({
        where: { deduplicationKey: identityHash },
        select: { id: true },
    });

    const staged = await prisma.stagedExam.create({
        data: {
            scrapeJobId,
            existingExamId: approvedExam?.id ?? null,
            title: exam.title,
            shortTitle: exam.shortTitle,
            slug: slugify(exam.shortTitle ?? exam.title),
            description: exam.description,
            conductingBody: exam.conductingBody,
            category: exam.category,
            examLevel: exam.examLevel,
            state: exam.state,
            age: exam.age,
            qualificationCriteria: exam.qualificationCriteria as never,
            totalVacancies: exam.totalVacancies,
            usefulLinks: exam.usefulLinks as any,
            applicationFee: exam.applicationFee as never,
            officialWebsite: exam.officialWebsite,
            notificationUrl: exam.notificationUrl,
            aiConfidence: exam.aiConfidence,
            aiNotes: exam.aiNotes,
            deduplicationKey: identityHash,   // hash
            contentHash,                           // hash
            isDuplicate: false,
            mergedSourceUrls: [exam.sourceUrl],
            sourceCount: 1,
            sourceUrl: exam.sourceUrl,
            scrapedAt: exam.scrapedAt,
            stagedEvents: {
                create: (exam.events ?? []).map((ev, i) => ({
                    stage: ev.stage,
                    stageOrder: ev.stageOrder ?? (i + 1) * 10,
                    title: ev.title,
                    description: ev.description,
                    startsAt: ev.startsAt,
                    endsAt: ev.endsAt,
                    isTBD: ev.isTBD ?? false,
                    actionUrl: ev.actionUrl,
                    actionLabel: ev.actionLabel,
                })),
            },
        },
        select: { id: true },
    });

    if (approvedExam) {
        logger.info(
            `[Dedup] L3 HIT — approved Exam ${approvedExam.id} exists. ` +
            `Staged as UPDATE candidate ${staged.id}.`,
        );
        return {
            outcome: 'LINKED_AS_UPDATE',
            stagedExamId: staged.id,
            existingExamId: approvedExam.id,
        };
    }

    logger.info(`[Dedup] No match — new StagedExam ${staged.id} created.`);
    return {
        outcome: 'NEW_STAGED',
        stagedExamId: staged.id,
    };
}
