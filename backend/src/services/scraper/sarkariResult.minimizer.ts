import prisma from '../../config/database';
import { logger } from '../../utils/logger';
import { HomePageEntry } from './sarkariResult.pipeline';

export interface MinimizerDecision {
    shouldScrape: boolean;
    reason: string;
    entry: HomePageEntry;
}

export class SarkariResultMinimizer {
    private static memoryCache = new Map<string, {
        sectionId: string;
        title: string;
        lastScrapedAt: Date;
    }>();

    /**
     * Filters homepage entries to only those that genuinely need detail scraping.
     * Reduces network calls by 90%+!
     */
    static async filterEntriesToScrape(
        allEntries: HomePageEntry[],
        options: { cooldownHours?: number; forceRescrape?: boolean } = {}
    ): Promise<{ toScrape: HomePageEntry[]; skipped: { slug: string; reason: string }[] }> {
        const cooldownHours = options.cooldownHours ?? 24;
        const forceRescrape = options.forceRescrape ?? false;

        if (forceRescrape) {
            return {
                toScrape: allEntries,
                skipped: [],
            };
        }

        const slugs = allEntries.map((e) => e.slug);

        // Batch pre-fetch existing records from DB in a single query
        const existingExams = await prisma.exam.findMany({
            where: { slug: { in: slugs } },
            select: {
                id: true,
                slug: true,
                status: true,
                updatedAt: true,
                lifecycleEvents: { select: { stage: true } },
            },
        });

        const existingStaged = await prisma.stagedExam.findMany({
            where: { slug: { in: slugs } },
            select: {
                id: true,
                slug: true,
                status: true,
                reviewStatus: true,
                updatedAt: true,
            },
        });

        const examMap = new Map(existingExams.map((e) => [e.slug, e]));
        const stagedMap = new Map(existingStaged.map((s) => [s.slug, s]));

        const toScrape: HomePageEntry[] = [];
        const skipped: { slug: string; reason: string }[] = [];

        const nowMs = Date.now();
        const cooldownMs = cooldownHours * 60 * 60 * 1000;

        for (const entry of allEntries) {
            const decision = this.evaluateEntry(entry, examMap.get(entry.slug), stagedMap.get(entry.slug), nowMs, cooldownMs);

            if (decision.shouldScrape) {
                toScrape.push(entry);
                logger.debug(`[Minimizer] INCLUDE ${entry.slug}: ${decision.reason}`);
            } else {
                skipped.push({ slug: entry.slug, reason: decision.reason });
                logger.debug(`[Minimizer] SKIP ${entry.slug}: ${decision.reason}`);
            }
        }

        logger.info(
            `[Minimizer] Optimization report: Total ${allEntries.length} entries evaluated → ` +
            `${toScrape.length} to scrape (${Math.round((skipped.length / (allEntries.length || 1)) * 100)}% network requests saved).`
        );

        return { toScrape, skipped };
    }

    private static evaluateEntry(
        entry: HomePageEntry,
        existingExam: any,
        existingStaged: any,
        nowMs: number,
        cooldownMs: number
    ): MinimizerDecision {
        const cached = this.memoryCache.get(entry.slug);

        // 1. New entry: Neither in memory cache, nor in Exam, nor in StagedExam
        if (!existingExam && !existingStaged) {
            return {
                shouldScrape: true,
                reason: 'New entry not yet present in database',
                entry,
            };
        }

        // 2. Section progression: Entry moved to a new section (e.g. from Jobs to Admit Cards / Results)
        if (cached && cached.sectionId !== entry.sectionId) {
            return {
                shouldScrape: true,
                reason: `Section changed from "${cached.sectionId}" to "${entry.sectionId}" on homepage`,
                entry,
            };
        }

        // 3. Anchor text changed on homepage (e.g., "– Out", "– Last Date Extended", "– Result Declared")
        if (cached && cached.title !== entry.title) {
            return {
                shouldScrape: true,
                reason: `Homepage title updated from "${cached.title}" to "${entry.title}"`,
                entry,
            };
        }

        // 4. Check if existing approved exam already reflects the current section stage
        if (existingExam) {
            const hasSectionStage = existingExam.lifecycleEvents.some(
                (ev: any) => ev.stage === entry.stageHint
            );

            // If exam is in Results section and already has RESULT_DECLARED status
            if (entry.sectionId === 'results' && existingExam.status === 'RESULT_DECLARED') {
                return {
                    shouldScrape: false,
                    reason: 'Exam in database is already marked as RESULT_DECLARED',
                    entry,
                };
            }

            // If exam is in Admit Cards section and already has ADMIT_CARD_OUT status
            if (entry.sectionId === 'admit_cards' && existingExam.status === 'ADMIT_CARD_OUT') {
                return {
                    shouldScrape: false,
                    reason: 'Exam in database is already marked as ADMIT_CARD_OUT',
                    entry,
                };
            }

            // If exam in DB doesn't have the stage indicated by this section, we must scrape!
            if (!hasSectionStage) {
                return {
                    shouldScrape: true,
                    reason: `Exam in database is missing the "${entry.stageHint}" lifecycle stage`,
                    entry,
                };
            }

            // Cooldown check on approved exam
            const timeSinceUpdate = nowMs - new Date(existingExam.updatedAt).getTime();
            if (timeSinceUpdate < cooldownMs) {
                return {
                    shouldScrape: false,
                    reason: `Recently checked ${Math.round(timeSinceUpdate / (60 * 1000))} mins ago (cooldown active)`,
                    entry,
                };
            }
        }

        // 5. Check if staged exam was checked recently
        if (existingStaged) {
            const timeSinceUpdate = nowMs - new Date(existingStaged.updatedAt).getTime();
            if (timeSinceUpdate < cooldownMs) {
                return {
                    shouldScrape: false,
                    reason: `Staged exam updated ${Math.round(timeSinceUpdate / (60 * 1000))} mins ago (cooldown active)`,
                    entry,
                };
            }
        }

        return {
            shouldScrape: true,
            reason: 'Periodic cooldown window elapsed for detail re-check',
            entry,
        };
    }

    /**
     * Marks a slug as successfully scraped with its current section and title.
     */
    static recordScraped(slug: string, sectionId: string, title: string): void {
        this.memoryCache.set(slug, {
            sectionId,
            title,
            lastScrapedAt: new Date(),
        });
    }
}
