import prisma from '../../config/database';
import { logger } from '../../utils/logger';
import { cacheService } from '../../utils/cache';
import { ExamStatus, LifecycleStage } from '../../constants/enums';

export interface TrendingSyncSummary {
    evaluatedCount: number;
    trendingCount: number;
    addedToTrending: string[];
    removedFromTrending: string[];
    activeTrendingExams: {
        id: string;
        slug: string;
        title: string;
        status: string;
        score: number;
    }[];
}

export class TrendingService {
    private static MAX_TRENDING_COUNT = 12;
    private static RESULT_TRENDING_MAX_AGE_DAYS = 14;

    /**
     * Calculates the trending score for an exam based on:
     * 1. Lifecycle urgency (Admit Card out, Result just declared, Registration deadline approaching)
     * 2. Candidate volume / Authority prestige (SSC, UPSC, Railways, Banking, Defense, State Police)
     * 3. Freshness / recent updates
     */
    static calculateTrendingScore(exam: {
        id: string;
        slug: string;
        status: string;
        category: string;
        updatedAt: Date;
        publishedAt?: Date | null;
        lifecycleEvents: {
            stage: string;
            startsAt?: Date | null;
            endsAt?: Date | null;
            actionUrl?: string | null;
        }[];
    }, now: Date = new Date()): number {
        let score = 0;
        const nowMs = now.getTime();

        // ─── 1. Status Urgency Evaluation ──────────────────────────────────
        switch (exam.status) {
            case ExamStatus.ADMIT_CARD_OUT:
                score += 50; // Maximum urgency: Candidates actively downloading hall ticket
                break;

            case ExamStatus.RESULT_DECLARED: {
                // Check if result was announced recently (<= 14 days)
                const resultEv = exam.lifecycleEvents.find((e) => e.stage === LifecycleStage.RESULT);
                if (!resultEv?.actionUrl && !resultEv?.startsAt) {
                    score = 0;
                    return 0;
                }
                const resultDateMs = resultEv?.startsAt ? new Date(resultEv.startsAt).getTime() : new Date(exam.updatedAt).getTime();
                const daysSinceResult = (nowMs - resultDateMs) / (24 * 60 * 60 * 1000);

                if (daysSinceResult <= this.RESULT_TRENDING_MAX_AGE_DAYS) {
                    score += 45; // High urgency: Result just announced
                } else {
                    // Stale result (> 14 days) -> Do NOT trend
                    score = 0;
                    return 0;
                }
                break;
            }

            case ExamStatus.REGISTRATION_OPEN: {
                const regEv = exam.lifecycleEvents.find((e) => e.stage === LifecycleStage.REGISTRATION);
                if (regEv?.endsAt) {
                    const daysRemaining = (new Date(regEv.endsAt).getTime() - nowMs) / (24 * 60 * 60 * 1000);
                    if (daysRemaining > 0 && daysRemaining <= 7) {
                        score += 45; // Last few days to apply!
                    } else if (daysRemaining > 0) {
                        score += 35; // Application window open
                    } else {
                        score += 10;
                    }
                } else {
                    score += 35;
                }
                break;
            }

            case ExamStatus.ANSWER_KEY_OUT:
                score += 35; // Objection / response sheet active
                break;

            case ExamStatus.EXAM_ONGOING:
                score += 30; // Examination phase currently live
                break;

            case ExamStatus.NOTIFICATION:
                score += 20; // Fresh notification just dropped
                break;

            case ExamStatus.ADMIT_CARD_COMING_SOON:
                score += 15;
                break;

            case ExamStatus.RESULT_COMING_SOON:
                score += 15;
                break;

            case ExamStatus.REGISTRATION_CLOSED:
            case ExamStatus.EXAM_COMPLETED:
            case ExamStatus.ARCHIVED:
                // Passive waiting period or archived -> should NOT trend
                score = 0;
                return 0;

            default:
                score += 5;
                break;
        }

        // ─── 2. Flagship Category / High-Volume Authority Boost ───────────
        if (['SSC', 'UPSC', 'RAILWAY_JOBS', 'BANKING_JOBS', 'DEFENCE_JOBS'].includes(exam.category)) {
            score += 15;
        } else if (['POLICE_JOBS', 'STATE_PSC'].includes(exam.category)) {
            score += 10;
        }

        // ─── 3. Recency Boost (updated in last 48 hours) ───────────────────
        const hoursSinceUpdate = (nowMs - new Date(exam.updatedAt).getTime()) / (60 * 60 * 1000);
        if (hoursSinceUpdate <= 48) {
            score += 10;
        }

        // ─── 4. Active Action URLs bonus ──────────────────────────────────
        const hasLiveActionUrl = exam.lifecycleEvents.some((e) => e.actionUrl && e.actionUrl.trim().length > 0);
        if (hasLiveActionUrl) {
            score += 5;
        }

        return score;
    }

    /**
     * Re-evaluates all published exams, automatically adds trending tags to top active exams,
     * and automatically removes trending tags from stale, concluded, or low-scoring exams.
     */
    static async syncTrendingExams(targetCount = TrendingService.MAX_TRENDING_COUNT): Promise<TrendingSyncSummary> {
        logger.info(`[TrendingService] Starting automatic trending evaluation (Target: ${targetCount})...`);

        // 1. Fetch all published exams with lifecycle events
        const exams = await prisma.exam.findMany({
            where: { isPublished: true },
            select: {
                id: true,
                slug: true,
                title: true,
                status: true,
                category: true,
                isTrending: true,
                updatedAt: true,
                publishedAt: true,
                lifecycleEvents: {
                    select: { stage: true, startsAt: true, endsAt: true, actionUrl: true },
                },
            },
        });

        const now = new Date();
        const scoredExams = exams.map((exam) => ({
            ...exam,
            score: this.calculateTrendingScore(exam, now),
        }));

        // Sort descending by score, then by updatedAt
        scoredExams.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        // Filter those with qualifying scores (score >= 35) up to targetCount
        const qualifyingTrending = scoredExams
            .filter((e) => e.score >= 35)
            .slice(0, targetCount);

        const newTrendingIds = new Set(qualifyingTrending.map((e) => e.id));

        const toAddTrending: string[] = [];
        const toRemoveTrending: string[] = [];

        for (const exam of exams) {
            const shouldBeTrending = newTrendingIds.has(exam.id);

            if (shouldBeTrending && !exam.isTrending) {
                toAddTrending.push(exam.id);
            } else if (!shouldBeTrending && exam.isTrending) {
                toRemoveTrending.push(exam.id);
            }
        }

        // 2. Apply database updates in transaction
        if (toAddTrending.length > 0 || toRemoveTrending.length > 0) {
            await prisma.$transaction([
                ...(toAddTrending.length > 0
                    ? [
                        prisma.exam.updateMany({
                            where: { id: { in: toAddTrending } },
                            data: { isTrending: true },
                        }),
                    ]
                    : []),
                ...(toRemoveTrending.length > 0
                    ? [
                        prisma.exam.updateMany({
                            where: { id: { in: toRemoveTrending } },
                            data: { isTrending: false },
                        }),
                    ]
                    : []),
            ]);

            // 3. Purge related caches
            await cacheService.delPattern('home:trending:*');
            await cacheService.delPattern('home:ticker:*');
            await cacheService.delPattern('exams:*');

            logger.info(
                `[TrendingService] Synced trending exams: Added ${toAddTrending.length}, Removed ${toRemoveTrending.length}. ` +
                `Active Trending: ${qualifyingTrending.length}/${exams.length}`
            );
        } else {
            logger.info(`[TrendingService] All trending exams are already up-to-date (${qualifyingTrending.length} active).`);
        }

        const addedSlugs = exams.filter((e) => toAddTrending.includes(e.id)).map((e) => e.slug);
        const removedSlugs = exams.filter((e) => toRemoveTrending.includes(e.id)).map((e) => e.slug);

        return {
            evaluatedCount: exams.length,
            trendingCount: qualifyingTrending.length,
            addedToTrending: addedSlugs,
            removedFromTrending: removedSlugs,
            activeTrendingExams: qualifyingTrending.map((e) => ({
                id: e.id,
                slug: e.slug,
                title: e.title,
                status: e.status,
                score: e.score,
            })),
        };
    }
}
