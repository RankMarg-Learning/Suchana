import * as cheerio from 'cheerio';
import prisma from '../../config/database';
import { logger } from '../../utils/logger';
import { RuleEngineService } from './rules/ruleEngine.service';
import { SarkariResultParser } from './sarkariResult.parser';
import { ScraperUtils } from './scraper.utils';
import { ScrapeJobStatus, LifecycleStage, ExamStatus, STAGE_ORDER_MAP } from '../../constants/enums';
import { AiStructuredExam, AiStructuredEvent, buildIdentityHash, buildContentHash } from '../deduplication.service';
import { cacheService } from '../../utils/cache';
import { internalScraperQueue } from './internalQueue.service';
import { ExamValidationService } from './examValidation.service';
import { ExamStatusResolver } from './examStatusResolver';
import { TrendingService } from './trending.service';

export interface HomePageEntry {
    slug: string;
    title: string;
    url: string;
    sectionId: string;
    sectionName: string;
    stageHint: string;
    statusHint: string;
    priority: number;
    sourcePageUrl?: string;
}

export interface PipelineItemResult {
    slug: string;
    title: string;
    sourceUrl: string;
    sectionName: string;
    outcome: 'NEW_STAGED' | 'UPDATED_WITH_NEW_DATES' | 'UP_TO_DATE' | 'ERROR';
    stagedExamId?: string;
    existingExamId?: string;
    promotedToMainExam?: boolean;
    publishedExamId?: string;
    validationErrors?: string[];
    diffs?: string[];
    reason?: string;
}

export interface PipelineSummary {
    jobId: string;
    status: string;
    totalScanned: number;
    newStagedCount: number;
    promotedCount: number;
    updatedCount: number;
    upToDateCount: number;
    skippedCount: number;
    errorCount: number;
    results: PipelineItemResult[];
    startedAt: Date;
    completedAt: Date;
}

export interface PipelineOptions {
    maxEntries?: number;
    sections?: string[];
    sourceScope?: 'HOME' | 'SECTIONS' | 'ALL';
    minDelayMs?: number;
    maxDelayMs?: number;
    delayMs?: number;
    autoPromoteNew?: boolean;
    forceRescrape?: boolean;
    useInternalQueue?: boolean;
}

export class SarkariResultPipeline {
    private static SOURCE_LABEL = 'SarkariResult Home Pipeline';
    private static SOURCE_URL = 'https://sarkariresult.com.cm/';

    /**
     * Scrapes the home page entries from Results, Admit Cards, Latest Jobs, Answer Key.
     */
    static async scrapeHomePageEntries(filterSections?: string[]): Promise<HomePageEntry[]> {
        const rules = RuleEngineService.getRules();
        logger.info(`[Pipeline] Fetching home page: ${rules.homePage.url}`);
        const html = await ScraperUtils.fetchHtml(rules.homePage.url, {
            referer: 'https://www.google.com/',
            enableJitter: true,
            minDelayMs: 300,
            maxDelayMs: 800,
        });
        const $ = cheerio.load(html);

        const sections = rules.homePage.sections;
        const allEntries: HomePageEntry[] = [];
        const seenSlugs = new Set<string>();
        const excludedSlugs = new Set(rules.homePage.linkFilters.excludeSlugList || []);

        for (const sec of sections) {
            if (filterSections && filterSections.length > 0 && !filterSections.includes(sec.id)) {
                continue;
            }

            let foundContainer: cheerio.Cheerio<any> | null = null;
            $('.gb-headline').each((_, el) => {
                const hText = $(el).text().trim();
                if (sec.headerPatterns.some((p) => new RegExp(p, 'i').test(hText))) {
                    foundContainer = $(el).closest('.gb-container');
                }
            });

            if (foundContainer) {
                (foundContainer as cheerio.Cheerio<any>).find('a').each((_, a) => {
                    const href = $(a).attr('href');
                    if (!href) return;
                    const cleanHref = href.trim();

                    // Check exclude url patterns
                    const isExcluded = rules.homePage.linkFilters.excludeUrlPatterns.some((p) =>
                        new RegExp(p, 'i').test(cleanHref),
                    );
                    if (isExcluded) return;

                    const slug = SarkariResultParser.extractSlugFromUrl(cleanHref);
                    if (excludedSlugs.has(slug)) return;
                    if (!new RegExp(rules.homePage.linkFilters.includeSlugRegex).test(slug)) {
                        return;
                    }

                    const title = $(a).text().replace(/\s+/g, ' ').trim();
                    if (!title || title.length < 3) return;

                    // Prioritize first appearance
                    if (!seenSlugs.has(slug)) {
                        seenSlugs.add(slug);
                        allEntries.push({
                            slug,
                            title,
                            url: cleanHref,
                            sectionId: sec.id,
                            sectionName: sec.name,
                            stageHint: sec.stageHint,
                            statusHint: sec.statusHint,
                            priority: sec.priority,
                            sourcePageUrl: rules.homePage.url,
                        });
                    }
                });
            }
        }

        logger.info(`[Pipeline] Found ${allEntries.length} unique slugs from home page across sections`);
        return allEntries;
    }

    /**
     * Scrapes a dedicated section page (e.g. /result/, /admit-card/, /latest-jobs/, /answer-key/).
     * Retrieves up to ~100 archive entries per section for complete lifecycle coverage.
     */
    static async scrapeSectionPageEntries(sec: {
        id: string;
        name: string;
        url?: string;
        stageHint: string;
        statusHint: string;
        priority: number;
    }): Promise<HomePageEntry[]> {
        const rules = RuleEngineService.getRules();
        const sectionUrl = sec.url || `${rules.homePage.url}${sec.id.replace(/_/g, '-')}/`;
        logger.info(`[Pipeline] Fetching dedicated section page: ${sec.name} (${sectionUrl})`);

        const html = await ScraperUtils.fetchHtml(sectionUrl, {
            referer: rules.homePage.url,
            enableJitter: true,
            minDelayMs: 400,
            maxDelayMs: 900,
        });
        const $ = cheerio.load(html);

        const entries: HomePageEntry[] = [];
        const seenSlugs = new Set<string>();
        const excludedSlugs = new Set(rules.homePage.linkFilters.excludeSlugList || []);

        $('ul li a').each((_, a) => {
            const href = $(a).attr('href');
            if (!href) return;
            const cleanHref = href.trim();

            const isExcludedUrl = rules.homePage.linkFilters.excludeUrlPatterns.some((p) =>
                new RegExp(p, 'i').test(cleanHref),
            );
            if (isExcludedUrl) return;

            const slug = SarkariResultParser.extractSlugFromUrl(cleanHref);
            if (excludedSlugs.has(slug)) return;
            if (!new RegExp(rules.homePage.linkFilters.includeSlugRegex).test(slug)) return;

            const title = $(a).text().replace(/\s+/g, ' ').trim();
            if (!title || title.length < 3) return;

            if (!seenSlugs.has(slug)) {
                seenSlugs.add(slug);
                entries.push({
                    slug,
                    title,
                    url: cleanHref,
                    sectionId: sec.id,
                    sectionName: sec.name,
                    stageHint: sec.stageHint,
                    statusHint: sec.statusHint,
                    priority: sec.priority,
                    sourcePageUrl: sectionUrl,
                });
            }
        });

        logger.info(`[Pipeline] Extracted ${entries.length} listings from section page: ${sec.name}`);
        return entries;
    }

    /**
     * Unified Listing Scraper & In-Memory Deduplicator.
     * Can query Homepage, Dedicated Sections, or both ('ALL').
     * If an exam slug appears across multiple pages/sections, it is merged into a single entry
     * prioritizing the latest lifecycle stage (Results > Admit Cards > Latest Jobs > Answer Key).
     */
    static async scrapeAllListingEntries(options: {
        sourceScope?: 'HOME' | 'SECTIONS' | 'ALL';
        sections?: string[];
    } = {}): Promise<HomePageEntry[]> {
        const scope = options.sourceScope || 'ALL';
        const rules = RuleEngineService.getRules();
        const activeSections = rules.homePage.sections.filter(
            (s) => !options.sections || options.sections.length === 0 || options.sections.includes(s.id)
        );

        const candidateEntries: HomePageEntry[] = [];

        // 1. Scrape Homepage if requested
        if (scope === 'HOME' || scope === 'ALL') {
            const homeEntries = await this.scrapeHomePageEntries(options.sections);
            candidateEntries.push(...homeEntries);
        }

        // 2. Scrape Dedicated Section Pages if requested
        if (scope === 'SECTIONS' || scope === 'ALL') {
            for (const sec of activeSections) {
                try {
                    // Polite human pause between section listing page requests
                    await ScraperUtils.humanDelay(500, 1000);
                    const secEntries = await this.scrapeSectionPageEntries(sec);
                    candidateEntries.push(...secEntries);
                } catch (secErr: any) {
                    logger.warn(`[Pipeline] Failed to fetch section page ${sec.name}: ${secErr.message}`);
                }
            }
        }

        // 3. Unified In-Memory Deduplication: Keep highest lifecycle priority per slug
        const deduplicatedMap = new Map<string, HomePageEntry>();

        for (const entry of candidateEntries) {
            const existing = deduplicatedMap.get(entry.slug);
            if (!existing) {
                deduplicatedMap.set(entry.slug, entry);
            } else {
                // If new entry has higher priority (lower number, e.g. Results: 10 vs Latest Jobs: 30)
                if (entry.priority < existing.priority) {
                    deduplicatedMap.set(entry.slug, {
                        ...entry,
                        title: entry.title.length >= existing.title.length ? entry.title : existing.title,
                    });
                }
            }
        }

        const uniqueEntries = Array.from(deduplicatedMap.values());
        logger.info(
            `[Pipeline] Listing Discovery complete: ${candidateEntries.length} raw links → ` +
            `${uniqueEntries.length} unique deduplicated exams across scope [${scope}]`
        );
        return uniqueEntries;
    }

    /**
     * Detects if any new dates, action links, or lifecycle stages were added.
     */
    static diffEvents(
        existingEvents: { stage: string; startsAt?: Date | null; endsAt?: Date | null; isTBD?: boolean; actionUrl?: string | null; description?: string | null }[],
        newEvents: AiStructuredEvent[]
    ): { hasChanges: boolean; diffs: string[] } {
        const diffs: string[] = [];

        const existingMap = new Map<string, { startsAt?: Date | null; endsAt?: Date | null; isTBD?: boolean; actionUrl?: string | null; description?: string | null }>();
        for (const ev of existingEvents) {
            existingMap.set(ev.stage, ev);
        }

        for (const nev of newEvents) {
            const old = existingMap.get(nev.stage);
            if (!old) {
                // Brand new stage added (e.g., RESULT or ANSWER_KEY just introduced)
                diffs.push(`New stage [${nev.stage}] added to lifecycle.`);
                continue;
            }

            // Check if date was previously TBD or null and now has a concrete date
            if ((old.isTBD || !old.startsAt) && (nev.startsAt && !nev.isTBD)) {
                diffs.push(`Stage [${nev.stage}] date announced: ${nev.startsAt.toISOString().slice(0, 10)} (previously TBD).`);
            } else if (nev.startsAt && old.startsAt) {
                const oldStart = new Date(old.startsAt).getTime();
                const newStart = new Date(nev.startsAt).getTime();
                if (Math.abs(oldStart - newStart) > 24 * 60 * 60 * 1000) {
                    diffs.push(`Stage [${nev.stage}] start date updated: ${nev.startsAt.toISOString().slice(0, 10)}.`);
                }
            }

            // Check endsAt date change
            if (nev.endsAt && old.endsAt) {
                const oldEnd = new Date(old.endsAt).getTime();
                const newEnd = new Date(nev.endsAt).getTime();
                if (Math.abs(oldEnd - newEnd) > 24 * 60 * 60 * 1000) {
                    diffs.push(`Stage [${nev.stage}] end date updated: ${nev.endsAt.toISOString().slice(0, 10)}.`);
                }
            } else if (nev.endsAt && !old.endsAt) {
                diffs.push(`Stage [${nev.stage}] end date added: ${nev.endsAt.toISOString().slice(0, 10)}.`);
            }

            // Check actionUrl addition (e.g. Admit card download link or Result link went live!)
            if (nev.actionUrl && (!old.actionUrl || old.actionUrl !== nev.actionUrl)) {
                diffs.push(`Stage [${nev.stage}] actionUrl added/updated: ${nev.actionUrl}.`);
            }

            // Check description update (e.g. Multi-links like List-I, List-II, Cutoffs added)
            if (nev.description && (!old.description || old.description !== nev.description)) {
                diffs.push(`Stage [${nev.stage}] description updated.`);
            }
        }

        return {
            hasChanges: diffs.length > 0,
            diffs,
        };
    }

    /**
     * Processes a single slug item: checks deduplication, scrapes detail, diffs or stages.
     */
    static async processSlugItem(
        entry: HomePageEntry,
        scrapeJobId: string,
        autoPromote: boolean = false
    ): Promise<PipelineItemResult> {
        try {
            logger.info(`[Pipeline] Processing slug: ${entry.slug} (${entry.sectionName})`);

            // 1. Fetch and parse detail page using realistic browser persona, referer, and human pacing
            const referer = entry.sourcePageUrl || 'https://sarkariresult.com.cm/';
            const html = await ScraperUtils.fetchHtml(entry.url, {
                referer,
                enableJitter: true,
                minDelayMs: 400,
                maxDelayMs: 900,
            });
            const extracted = await SarkariResultParser.parseDetailPage(html, entry.url, entry.sectionId.toUpperCase());

            // 2. Build deduplication keys
            const identityHash = buildIdentityHash(
                extracted.conductingBody,
                extracted.shortTitle ?? extracted.title,
                extracted.examYear
            );
            const contentHash = buildContentHash(extracted);

            // 3. Deduplication Check against existing Exams and StagedExams
            let approvedExam = await prisma.exam.findFirst({
                where: {
                    OR: [
                        { slug: entry.slug },
                        { notificationUrl: entry.url },
                        ...(identityHash ? [{ deduplicationKey: identityHash }] : []),
                    ],
                },
                include: {
                    lifecycleEvents: { orderBy: { stageOrder: 'asc' } },
                },
            });

            let stagedExam = await prisma.stagedExam.findFirst({
                where: {
                    OR: [
                        { slug: entry.slug },
                        { sourceUrl: entry.url },
                        { mergedSourceUrls: { has: entry.url } },
                        ...(identityHash ? [{ deduplicationKey: identityHash }] : []),
                    ],
                },
                include: {
                    stagedEvents: { orderBy: { stageOrder: 'asc' } },
                },
            });

            if (!approvedExam && stagedExam?.existingExamId) {
                approvedExam = await prisma.exam.findUnique({
                    where: { id: stagedExam.existingExamId },
                    include: { lifecycleEvents: { orderBy: { stageOrder: 'asc' } } },
                });
            }

            // 4. Scenario A: Approved Exam already exists in database -> Check for stage/info updates!
            if (approvedExam) {
                const diff = this.diffEvents(approvedExam.lifecycleEvents, extracted.events ?? []);
                const statusProgression = Boolean(extracted.status && extracted.status !== approvedExam.status);
                const needsPublish = !approvedExam.isPublished;
                const hasChanges = diff.hasChanges || statusProgression || needsPublish;

                if (hasChanges) {
                    logger.info(`[Pipeline] Updating existing approved exam ${approvedExam.id} (${entry.slug}):\n${diff.diffs.join('\n') || `Status progression: ${approvedExam.status} -> ${extracted.status}`}`);

                    await prisma.$transaction(async (tx) => {
                        // Ensure exam is published, update status and rich fields
                        await tx.exam.update({
                            where: { id: approvedExam.id },
                            data: {
                                isPublished: true,
                                publishedAt: approvedExam.publishedAt ?? new Date(),
                                status: extracted.status ?? approvedExam.status,
                                ...(extracted.conductingBody && (!approvedExam.conductingBody || approvedExam.conductingBody === 'Unknown') ? { conductingBody: extracted.conductingBody } : {}),
                                ...(extracted.category && (!approvedExam.category || approvedExam.category === 'OTHER') ? { category: extracted.category } : {}),
                                ...(extracted.state && !approvedExam.state ? { state: extracted.state } : {}),
                                ...(extracted.totalVacancies && !approvedExam.totalVacancies ? { totalVacancies: extracted.totalVacancies } : {}),
                                ...(extracted.officialWebsite ? { officialWebsite: extracted.officialWebsite } : {}),
                                ...(extracted.notificationUrl ? { notificationUrl: extracted.notificationUrl } : {}),
                                ...(extracted.description && (!approvedExam.description || extracted.description.length > approvedExam.description.length) ? { description: extracted.description } : {}),
                                updatedAt: new Date(),
                            },
                        });

                        // Upsert lifecycle events with strict STAGE_ORDER_MAP and LifecycleStage enum
                        for (const ev of extracted.events ?? []) {
                            const stageEnum = ev.stage as LifecycleStage;
                            const stageOrder = STAGE_ORDER_MAP[stageEnum] ?? ev.stageOrder ?? 50;

                            const existingEvent = approvedExam.lifecycleEvents.find((e) => e.stage === ev.stage);
                            if (existingEvent) {
                                await tx.lifecycleEvent.update({
                                    where: { id: existingEvent.id },
                                    data: {
                                        stageOrder,
                                        title: ev.title || existingEvent.title,
                                        description: ev.description || existingEvent.description,
                                        startsAt: ev.startsAt ? new Date(ev.startsAt) : existingEvent.startsAt,
                                        endsAt: ev.endsAt ? new Date(ev.endsAt) : existingEvent.endsAt,
                                        isTBD: ev.isTBD ?? existingEvent.isTBD,
                                        actionUrl: ev.actionUrl || existingEvent.actionUrl,
                                        actionLabel: ev.actionLabel || existingEvent.actionLabel,
                                    },
                                });
                            } else {
                                await tx.lifecycleEvent.create({
                                    data: {
                                        examId: approvedExam.id,
                                        stage: stageEnum,
                                        stageOrder,
                                        title: ev.title,
                                        description: ev.description,
                                        startsAt: ev.startsAt ? new Date(ev.startsAt) : undefined,
                                        endsAt: ev.endsAt ? new Date(ev.endsAt) : undefined,
                                        isTBD: ev.isTBD ?? false,
                                        actionUrl: ev.actionUrl,
                                        actionLabel: ev.actionLabel,
                                        createdBy: 'system_pipeline_update',
                                    },
                                });
                            }
                        }

                        // Also keep linked stagedExam synced as APPROVED if present
                        if (stagedExam) {
                            await tx.stagedExam.update({
                                where: { id: stagedExam.id },
                                data: {
                                    reviewStatus: 'APPROVED',
                                    status: extracted.status ?? stagedExam.status,
                                    updatedAt: new Date(),
                                },
                            });
                        }
                    }, { timeout: 30000, maxWait: 10000 });

                    // Clear redis cache for fresh data delivery
                    await cacheService.del(`exams:detail:${approvedExam.id}`);
                    await cacheService.del(`exams:slug:${approvedExam.slug}`);
                    await cacheService.delPattern('exams:list:*');
                    await cacheService.delPattern('home:*');

                    return {
                        slug: entry.slug,
                        title: extracted.title,
                        sourceUrl: entry.url,
                        sectionName: entry.sectionName,
                        outcome: 'UPDATED_WITH_NEW_DATES',
                        existingExamId: approvedExam.id,
                        diffs: diff.diffs.length > 0 ? diff.diffs : [`Status: ${approvedExam.status} -> ${extracted.status}`],
                    };
                }

                return {
                    slug: entry.slug,
                    title: extracted.title,
                    sourceUrl: entry.url,
                    sectionName: entry.sectionName,
                    outcome: 'UP_TO_DATE',
                    existingExamId: approvedExam.id,
                    reason: 'All lifecycle stages, dates, and official links match current records',
                };
            }

            // 5. Scenario B: Staged Exam exists (in review pipeline)
            if (stagedExam) {
                const diff = this.diffEvents(stagedExam.stagedEvents, extracted.events ?? []);

                if (diff.hasChanges) {
                    logger.info(`[Pipeline] New dates/info detected for staged exam ${stagedExam.id} (${entry.slug}):\n${diff.diffs.join('\n')}`);

                    await prisma.$transaction(async (tx) => {
                        await tx.stagedExam.update({
                            where: { id: stagedExam.id },
                            data: {
                                status: extracted.status ?? stagedExam.status,
                                totalVacancies: extracted.totalVacancies ?? stagedExam.totalVacancies,
                                applicationFee: extracted.applicationFee ?? stagedExam.applicationFee,
                                officialWebsite: extracted.officialWebsite ?? stagedExam.officialWebsite,
                                notificationUrl: extracted.notificationUrl ?? stagedExam.notificationUrl,
                                description: extracted.description ?? stagedExam.description,
                                updatedAt: new Date(),
                            },
                        });

                        // Re-sync staged events with strict STAGE_ORDER_MAP
                        await tx.stagedLifecycleEvent.deleteMany({
                            where: { stagedExamId: stagedExam.id },
                        });

                        await tx.stagedLifecycleEvent.createMany({
                            data: (extracted.events ?? []).map((ev) => ({
                                stagedExamId: stagedExam.id,
                                stage: ev.stage,
                                stageOrder: STAGE_ORDER_MAP[ev.stage as LifecycleStage] ?? ev.stageOrder ?? 50,
                                title: ev.title,
                                description: ev.description,
                                startsAt: ev.startsAt ? new Date(ev.startsAt) : undefined,
                                endsAt: ev.endsAt ? new Date(ev.endsAt) : undefined,
                                isTBD: ev.isTBD ?? false,
                                actionUrl: ev.actionUrl,
                                actionLabel: ev.actionLabel,
                            })),
                        });
                    }, { timeout: 30000, maxWait: 10000 });
                }

                // If autoPromote is active, auto-promote StagedExam to main Exam table with isPublished: true
                if (autoPromote) {
                    const promoResult = await ExamValidationService.validateAndPromote(
                        stagedExam.id,
                        'system_auto_validator',
                        entry.sectionName
                    );
                    if (promoResult.promoted) {
                        return {
                            slug: entry.slug,
                            title: extracted.title,
                            sourceUrl: entry.url,
                            sectionName: entry.sectionName,
                            outcome: 'NEW_STAGED',
                            stagedExamId: stagedExam.id,
                            promotedToMainExam: true,
                            publishedExamId: promoResult.examId,
                        };
                    }
                }

                return {
                    slug: entry.slug,
                    title: extracted.title,
                    sourceUrl: entry.url,
                    sectionName: entry.sectionName,
                    outcome: diff.hasChanges ? 'UPDATED_WITH_NEW_DATES' : 'UP_TO_DATE',
                    stagedExamId: stagedExam.id,
                    diffs: diff.diffs,
                    reason: diff.hasChanges ? undefined : 'Staged exam already up to date',
                };
            }

            // 6. Scenario C: FIRST TIME (Brand New Exam - Not found in Exam or StagedExam)
            const staged = await prisma.stagedExam.create({
                data: {
                    scrapeJobId,
                    title: extracted.title,
                    shortTitle: extracted.shortTitle,
                    slug: entry.slug,
                    description: extracted.description,
                    conductingBody: extracted.conductingBody,
                    category: extracted.category,
                    status: extracted.status,
                    examLevel: extracted.examLevel,
                    state: extracted.state,
                    age: extracted.age,
                    qualificationCriteria: (extracted.qualificationCriteria as string | undefined) ?? null,
                    totalVacancies: extracted.totalVacancies,
                    salary: extracted.salary,
                    additionalDetails: extracted.additionalDetails,
                    applicationFee: (extracted.applicationFee as string | undefined) ?? null,
                    officialWebsite: extracted.officialWebsite,
                    notificationUrl: extracted.notificationUrl,
                    aiConfidence: extracted.aiConfidence ?? 0.95,
                    aiNotes: extracted.aiNotes,
                    deduplicationKey: identityHash,
                    contentHash,
                    isDuplicate: false,
                    mergedSourceUrls: [entry.url],
                    sourceCount: 1,
                    sourceUrl: entry.url,
                    scrapedAt: new Date(),
                    reviewStatus: autoPromote ? 'APPROVED' : 'PENDING',
                    stagedEvents: {
                        create: (extracted.events ?? []).map((ev) => ({
                            stage: ev.stage,
                            stageOrder: STAGE_ORDER_MAP[ev.stage as LifecycleStage] ?? ev.stageOrder ?? 50,
                            title: ev.title,
                            description: ev.description,
                            startsAt: ev.startsAt ? new Date(ev.startsAt) : undefined,
                            endsAt: ev.endsAt ? new Date(ev.endsAt) : undefined,
                            isTBD: ev.isTBD ?? false,
                            actionUrl: ev.actionUrl,
                            actionLabel: ev.actionLabel,
                        })),
                    },
                },
            });

            let promotedToMainExam = false;
            let publishedExamId: string | undefined = undefined;
            let validationErrors: string[] | undefined = undefined;

            if (autoPromote) {
                const autoPromo = await ExamValidationService.validateAndPromote(
                    staged.id,
                    'system_auto_pipeline',
                    entry.sectionId.toUpperCase()
                );
                promotedToMainExam = autoPromo.promoted;
                publishedExamId = autoPromo.examId;
                validationErrors = autoPromo.errors;
            }

            logger.info(
                `[Pipeline] Staged new exam ${staged.id} for slug ${entry.slug} ` +
                `(Auto-promoted to main Exam: ${promotedToMainExam ? 'YES (' + publishedExamId + ')' : 'NO (Validation blocked or pending)'})`
            );

            return {
                slug: entry.slug,
                title: extracted.title,
                sourceUrl: entry.url,
                sectionName: entry.sectionName,
                outcome: 'NEW_STAGED',
                stagedExamId: staged.id,
                promotedToMainExam,
                publishedExamId,
                validationErrors,
            };
        } catch (err: any) {
            logger.error(`[Pipeline] Failed to process ${entry.slug}: ${err.message}`);
            return {
                slug: entry.slug,
                title: entry.title,
                sourceUrl: entry.url,
                sectionName: entry.sectionName,
                outcome: 'ERROR',
                reason: err.message,
            };
        }
    }

    /**
     * Executes the full automatic home page scraping, deduplication, and update detection pipeline.
     * Uses SarkariResultMinimizer to skip unchanged pages (90%+ network savings)
     * and internal in-memory queue for task concurrency control (NO Redis!).
     */
    static async runPipeline(options: PipelineOptions = {}): Promise<PipelineSummary> {
        const startedAt = new Date();
        const maxEntries = options.maxEntries ?? 60;
        const autoPromote = options.autoPromoteNew ?? true;

        // 1. Ensure or find ScrapeSource record
        let source = await prisma.scrapeSource.findFirst({
            where: { url: this.SOURCE_URL },
        });

        if (!source) {
            source = await prisma.scrapeSource.create({
                data: {
                    label: this.SOURCE_LABEL,
                    url: this.SOURCE_URL,
                    sourceType: 'LISTING',
                    isActive: true,
                },
            });
        }

        // 2. Create ScrapeJob record
        const job = await prisma.scrapeJob.create({
            data: {
                scrapeSourceId: source.id,
                status: ScrapeJobStatus.RUNNING,
            },
        });

        const results: PipelineItemResult[] = [];
        let newStagedCount = 0;
        let promotedCount = 0;
        let updatedCount = 0;
        let upToDateCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        if (options.minDelayMs && options.maxDelayMs) {
            internalScraperQueue.setPacing(options.minDelayMs, options.maxDelayMs);
        }

        try {
            // 3. Extract listings using Unified Listing Discovery across requested scopes
            const entries = await this.scrapeAllListingEntries({
                sourceScope: options.sourceScope ?? 'ALL',
                sections: options.sections,
            });

            // 4. Inspect each exam directly without skipping by cooldown heuristics!
            // Each entry is scraped, deduplicated, and used to create or update lifecycle stages.
            const targetsToProcess = options.maxEntries ? entries.slice(0, options.maxEntries) : entries;
            logger.info(`[Pipeline] Inspecting ${targetsToProcess.length} total entries without skipping (Checking each exam for deduplication & stage updates)`);

            // 5. Enqueue tasks into internal in-memory queue (NO REDIS)
            if (targetsToProcess.length > 0) {
                const queueTasks = targetsToProcess.map((entry) => ({
                    name: `scrape:${entry.slug}`,
                    data: entry,
                    priority: entry.priority,
                    execute: async (target: HomePageEntry) => {
                        return this.processSlugItem(target, job.id, autoPromote);
                    },
                }));

                const taskResults = await internalScraperQueue.addBatchAndWait(queueTasks);

                for (const t of taskResults) {
                    if (t.status === 'COMPLETED' && t.result) {
                        results.push(t.result);
                        if (t.result.outcome === 'NEW_STAGED') newStagedCount++;
                        if (t.result.promotedToMainExam) promotedCount++;
                        if (t.result.outcome === 'UPDATED_WITH_NEW_DATES') updatedCount++;
                        if (t.result.outcome === 'UP_TO_DATE') upToDateCount++;
                        if (t.result.outcome === 'ERROR') errorCount++;
                    } else if (t.status === 'FAILED') {
                        errorCount++;
                        results.push({
                            slug: t.data.slug,
                            title: t.data.title,
                            sourceUrl: t.data.url,
                            sectionName: t.data.sectionName,
                            outcome: 'ERROR',
                            reason: t.error || 'Internal queue task failed',
                        });
                    }
                }
            }

            const completedAt = new Date();
            const finalStatus = errorCount === 0
                ? ScrapeJobStatus.COMPLETED
                : errorCount < targetsToProcess.length
                ? ScrapeJobStatus.PARTIAL
                : ScrapeJobStatus.FAILED;

            // 6. Update ScrapeJob record
            await prisma.scrapeJob.update({
                where: { id: job.id },
                data: {
                    status: finalStatus,
                    candidatesFound: newStagedCount + updatedCount,
                    completedAt,
                    rawPayload: {
                        summary: {
                            scanned: targetsToProcess.length,
                            skipped: skippedCount,
                            newStaged: newStagedCount,
                            promotedToMainExam: promotedCount,
                            updatedWithNewDates: updatedCount,
                            upToDate: upToDateCount,
                            errors: errorCount,
                        },
                        results: results.slice(0, 100),
                    } as any,
                },
            });

            logger.info(
                `[Pipeline] Finished! Scanned: ${targetsToProcess.length}, Skipped: ${skippedCount}, ` +
                `New: ${newStagedCount} (Promoted: ${promotedCount}), Updated: ${updatedCount}, UpToDate: ${upToDateCount}`
            );

            // Re-sync trending exams (auto-add active/urgent exams, auto-remove stale ones)
            try {
                await TrendingService.syncTrendingExams();
            } catch (trendErr: any) {
                logger.warn(`[Pipeline] Trending sync failed: ${trendErr.message}`);
            }

            return {
                jobId: job.id,
                status: finalStatus,
                totalScanned: targetsToProcess.length + skippedCount,
                newStagedCount,
                promotedCount,
                updatedCount,
                upToDateCount,
                skippedCount,
                errorCount,
                results,
                startedAt,
                completedAt,
            };
        } catch (err: any) {
            logger.error(`[Pipeline] Critical failure: ${err.message}`);
            await prisma.scrapeJob.update({
                where: { id: job.id },
                data: {
                    status: ScrapeJobStatus.FAILED,
                    errorMessage: err.message,
                    completedAt: new Date(),
                },
            });

            return {
                jobId: job.id,
                status: ScrapeJobStatus.FAILED,
                totalScanned: results.length,
                newStagedCount,
                promotedCount,
                updatedCount,
                upToDateCount,
                skippedCount,
                errorCount: errorCount + 1,
                results,
                startedAt,
                completedAt: new Date(),
            };
        }
    }

    /**
     * Selects a balanced sample of random exams from the home page (Results, Admit Cards, Latest Jobs, Answer Key),
     * enqueues them into the internal in-memory queue (NO Redis), parses them without LLMs,
     * validates them strictly, and auto-moves passing ones into the main Exam table!
     */
    static async runRandomSample(
        sampleSize = 10,
        autoPromote = true
    ): Promise<{
        jobId: string;
        selectedEntries: HomePageEntry[];
        results: PipelineItemResult[];
        stats: { total: number; newStaged: number; promoted: number; updated: number; upToDate: number; errors: number };
    }> {
        logger.info(`[Pipeline] Running random sample of ${sampleSize} exams via internal queue (autoPromote=${autoPromote})`);

        // 1. Fetch all valid listings across all sections (Home + Dedicated Section pages)
        const allEntries = await this.scrapeAllListingEntries({ sourceScope: 'ALL' });

        // 2. Group by section
        const bySection = new Map<string, HomePageEntry[]>();
        for (const e of allEntries) {
            const list = bySection.get(e.sectionId) || [];
            list.push(e);
            bySection.set(e.sectionId, list);
        }

        // 3. Pick balanced sample across sections
        const selectedEntries: HomePageEntry[] = [];
        const sectionIds = Array.from(bySection.keys());
        const perSection = Math.ceil(sampleSize / (sectionIds.length || 1));

        for (const secId of sectionIds) {
            const list = bySection.get(secId) || [];
            // Shuffle
            const shuffled = [...list].sort(() => 0.5 - Math.random());
            const picked = shuffled.slice(0, perSection);
            selectedEntries.push(...picked);
        }

        // Trim down to exact sampleSize
        const finalTargets = selectedEntries.slice(0, sampleSize);

        // 4. Ensure ScrapeJob
        let source = await prisma.scrapeSource.findFirst({ where: { url: this.SOURCE_URL } });
        if (!source) {
            source = await prisma.scrapeSource.create({
                data: { label: this.SOURCE_LABEL, url: this.SOURCE_URL, sourceType: 'LISTING' },
            });
        }

        const job = await prisma.scrapeJob.create({
            data: { scrapeSourceId: source.id, status: ScrapeJobStatus.RUNNING },
        });

        // 5. Enqueue tasks in internal in-memory queue (NO REDIS)
        const queueTasks = finalTargets.map((entry) => ({
            name: `random_sample:${entry.slug}`,
            data: entry,
            priority: entry.priority,
            execute: async (target: HomePageEntry) => {
                return this.processSlugItem(target, job.id, autoPromote);
            },
        }));

        logger.info(`[Pipeline] Enqueued ${queueTasks.length} tasks into internal in-memory queue`);
        const taskResults = await internalScraperQueue.addBatchAndWait(queueTasks);

        const results: PipelineItemResult[] = [];
        let newStaged = 0;
        let promoted = 0;
        let updated = 0;
        let upToDate = 0;
        let errors = 0;

        for (const t of taskResults) {
            if (t.status === 'COMPLETED' && t.result) {
                results.push(t.result);
                if (t.result.outcome === 'NEW_STAGED') newStaged++;
                if (t.result.promotedToMainExam) promoted++;
                if (t.result.outcome === 'UPDATED_WITH_NEW_DATES') updated++;
                if (t.result.outcome === 'UP_TO_DATE') upToDate++;
                if (t.result.outcome === 'ERROR') errors++;
            } else {
                errors++;
                results.push({
                    slug: t.data.slug,
                    title: t.data.title,
                    sourceUrl: t.data.url,
                    sectionName: t.data.sectionName,
                    outcome: 'ERROR',
                    reason: t.error || 'Failed in internal queue',
                });
            }
        }

        await prisma.scrapeJob.update({
            where: { id: job.id },
            data: {
                status: errors === 0 ? ScrapeJobStatus.COMPLETED : ScrapeJobStatus.PARTIAL,
                candidatesFound: newStaged + updated,
                completedAt: new Date(),
            },
        });

        logger.info(
            `[Pipeline] Random sample finished! Total: ${results.length}, New: ${newStaged}, ` +
            `Promoted: ${promoted}, Updated: ${updated}, UpToDate: ${upToDate}, Errors: ${errors}`
        );

        // Re-sync trending exams (auto-add active/urgent exams, auto-remove stale ones)
        try {
            await TrendingService.syncTrendingExams();
        } catch (trendErr: any) {
            logger.warn(`[Pipeline] Trending sync failed: ${trendErr.message}`);
        }

        return {
            jobId: job.id,
            selectedEntries: finalTargets,
            results,
            stats: {
                total: results.length,
                newStaged,
                promoted,
                updated,
                upToDate,
                errors,
            },
        };
    }
}
