import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError, buildPaginationMeta } from '../utils/apiResponse';
import * as scrapeSourceService from '../services/scrapeSource.service';
import * as reviewService from '../services/review.service';
import { runScrapeJob } from '../services/scraper.service';
import { logger } from '../utils/logger';
import { ScraperUtils } from '../services/scraper/scraper.utils';
import { AIProvider } from '../services/scraper/ai.provider';
import type {
    CreateScrapeSourceDto,
    UpdateScrapeSourceDto,
    ListScrapeSourceQuery,
    TriggerScrapeDto,
    ListStagedExamQuery,
    ReviewDecisionDto,
    UpdateStagedEventDto,
    CreateStagedEventDto,
    ExtractTextDto,
    ExtractJsonDto,
    TriggerSarkariResultPipelineDto,
    ParseSarkariResultUrlDto,
} from '../schemas/scraper.schema';
import { ScraperService } from '../services/scraper/scraper.core';
import { SarkariResultPipeline } from '../services/scraper/sarkariResult.pipeline';
import { SarkariResultParser } from '../services/scraper/sarkariResult.parser';
import { RuleEngineService } from '../services/scraper/rules/ruleEngine.service';
import { internalScraperQueue } from '../services/scraper/internalQueue.service';
import { TrendingService } from '../services/scraper/trending.service';
import prisma from '../config/database';



export async function listScrapeSources(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query as unknown as ListScrapeSourceQuery;
        const { sources, total } = await scrapeSourceService.listScrapeSources(query);
        sendSuccess(res, sources, 200, buildPaginationMeta(total, query.page ?? 1, query.limit ?? 20));
    } catch (err) {
        next(err);
    }
}

export async function getScrapeSourceById(req: Request, res: Response, next: NextFunction) {
    try {
        const source = await scrapeSourceService.getScrapeSourceById(req.params.id!);
        sendSuccess(res, source);
    } catch (err) {
        next(err);
    }
}

export async function createScrapeSource(req: Request, res: Response, next: NextFunction) {
    try {
        const source = await scrapeSourceService.createScrapeSource(req.body as CreateScrapeSourceDto);
        sendSuccess(res, source, 201);
    } catch (err) {
        next(err);
    }
}

export async function updateScrapeSource(req: Request, res: Response, next: NextFunction) {
    try {
        const source = await scrapeSourceService.updateScrapeSource(
            req.params.id!,
            req.body as UpdateScrapeSourceDto,
        );
        sendSuccess(res, source);
    } catch (err) {
        next(err);
    }
}

export async function deleteScrapeSource(req: Request, res: Response, next: NextFunction) {
    try {
        await scrapeSourceService.deleteScrapeSource(req.params.id!);
        sendSuccess(res, { deleted: true });
    } catch (err) {
        next(err);
    }
}


export async function listScrapeJobs(req: Request, res: Response, next: NextFunction) {
    try {
        const sourceId = req.query.sourceId as string | undefined;
        const limit = parseInt((req.query.limit as string) ?? '50', 10);
        const jobs = await scrapeSourceService.listScrapeJobs(sourceId, limit);
        sendSuccess(res, jobs);
    } catch (err) {
        next(err);
    }
}

export async function getScrapeJobById(req: Request, res: Response, next: NextFunction) {
    try {
        const job = await scrapeSourceService.getScrapeJobById(req.params.id!);
        sendSuccess(res, job);
    } catch (err) {
        next(err);
    }
}

// POST /api/v1/scraper/trigger  — async fire-and-forget (202)
export async function triggerScrape(req: Request, res: Response, next: NextFunction) {
    try {
        const { sourceId } = req.body as TriggerScrapeDto;
        const source = await scrapeSourceService.getScrapeSourceById(sourceId);

        if (!source.isActive) {
            sendError(res, 400, 'SOURCE_INACTIVE', 'This scrape source is disabled');
            return;
        }

        logger.info(`[Scraper] Admin triggered scrape for source ${sourceId}`);

        const scrapePromise = runScrapeJob({
            id: source.id,
            url: source.url,
            label: source.label,
            sourceType: source.sourceType,
            hintCategory: source.hintCategory,
            selectorHints: source.selectorHints as Record<string, unknown> | null,
        });

        res.status(202).json({
            success: true,
            data: {
                message: 'Scrape job started. Poll /scraper/jobs for status.',
                sourceId,
                sourceLabel: source.label,
            },
        });

        scrapePromise.catch((err) => {
            logger.error(`[Scraper] Background job failed for source ${sourceId}: ${err.message}`);
        });
    } catch (err) {
        next(err);
    }
}

// POST /api/v1/scraper/trigger/sync — synchronous (waits for result)
export async function triggerScrapeSync(req: Request, res: Response, next: NextFunction) {
    try {
        const { sourceId } = req.body as TriggerScrapeDto;
        const source = await scrapeSourceService.getScrapeSourceById(sourceId);

        if (!source.isActive) {
            sendError(res, 400, 'SOURCE_INACTIVE', 'This scrape source is disabled');
            return;
        }

        const result = await runScrapeJob({
            id: source.id,
            url: source.url,
            label: source.label,
            sourceType: source.sourceType,
            hintCategory: source.hintCategory,
            selectorHints: source.selectorHints as Record<string, unknown> | null,
        });

        sendSuccess(res, result, 200);
    } catch (err) {
        next(err);
    }
}

export async function testScraperDirect(req: Request, res: Response, next: NextFunction) {
    try {
        const { url, hintCategory } = req.body as { url: string; hintCategory?: string };
        if (!url) {
            sendError(res, 400, 'BAD_REQUEST', 'url is required');
            return;
        }

        logger.info(`[Scraper] Direct Test Triggered for: ${url}`);
        const html = await ScraperUtils.fetchHtml(url);

        let htmlToProcess = html;
        if (url.includes('testbook.com')) {
            const extractedHtml = ScraperUtils.extractTargetSections(html, ['updates', 'overview', 'important dates'], ['.table-responsive']);
            if (extractedHtml) htmlToProcess = `<article>${extractedHtml}</article>`;
        } else if (url.includes('sarkariresult.com.cm')) {
            const extractedHtml = ScraperUtils.extractTargetSections(html, [], ['.gb-container']);
            if (extractedHtml) htmlToProcess = `<article>${extractedHtml}</article>`;
        } else if (url.includes('jobapply24.in')) {
            const extractedHtml = ScraperUtils.extractTargetSections(html, [], ['.entry-content']);
            if (extractedHtml) htmlToProcess = `<article>${extractedHtml}</article>`;
        }

        const { text, charCount, extractedLinks } = ScraperUtils.cleanHtml(htmlToProcess, url);

        // const extracted = await AIProvider.extractExamData(text, url, hintCategory);

        // if (!extracted) {
        //     sendError(res, 500, 'AI_FAILED', 'AI failed to extract data');
        //     return;
        // }

        // extracted.sourceUrl = url;
        // extracted.scrapedAt = new Date();
        sendSuccess(res, text);
    } catch (err: any) {
        logger.error(`[Scraper] test-direct failed: ${err.message}`);
        sendError(res, 500, 'SCRAPE_TEST_FAILED', err.message);
    }
}

export async function listStagedExams(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query as unknown as ListStagedExamQuery;
        const { staged, total } = await reviewService.listStagedExams(query);
        sendSuccess(res, staged, 200, buildPaginationMeta(total, query.page ?? 1, query.limit ?? 20));
    } catch (err) {
        next(err);
    }
}

export async function getStagedExamById(req: Request, res: Response, next: NextFunction) {
    try {
        const staged = await reviewService.getStagedExamById(req.params.id!);
        sendSuccess(res, staged);
    } catch (err) {
        next(err);
    }
}

export async function reviewStagedExam(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await reviewService.reviewStagedExam(
            req.params.id!,
            req.body as ReviewDecisionDto,
            req.adminId!,
        );
        sendSuccess(res, result);
    } catch (err) {
        next(err);
    }
}

export async function updateStagedEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const updated = await reviewService.updateStagedEvent(
            req.params.stagedExamId!,
            req.params.eventId!,
            req.body as UpdateStagedEventDto,
        );
        sendSuccess(res, updated);
    } catch (err) {
        next(err);
    }
}

export async function addStagedEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event = await reviewService.addStagedEvent(
            req.params.stagedExamId!,
            req.body as CreateStagedEventDto,
        );
        sendSuccess(res, event, 201);
    } catch (err) {
        next(err);
    }
}

export async function deleteStagedEvent(req: Request, res: Response, next: NextFunction) {
    try {
        await reviewService.deleteStagedEvent(req.params.stagedExamId!, req.params.eventId!);
        sendSuccess(res, { deleted: true });
    } catch (err) {
        next(err);
    }
}

export async function getReviewStats(req: Request, res: Response, next: NextFunction) {
    try {
        const stats = await reviewService.getReviewStats();
        sendSuccess(res, stats);
    } catch (err) {
        next(err);
    }
}

export async function extractFromText(req: Request, res: Response, next: NextFunction) {
    try {
        const { text, sourceUrl, hintCategory } = req.body as ExtractTextDto;
        const result = await ScraperService.scrapeText(text, sourceUrl, hintCategory);
        sendSuccess(res, result);
    } catch (err) {
        next(err);
    }
}

export async function extractFromJson(req: Request, res: Response, next: NextFunction) {
    try {
        let { json, sourceUrl } = req.body as ExtractJsonDto;

        json = ScraperUtils.cleanJsonUrls(json);

        const result = await ScraperService.scrapeJson(json, sourceUrl);
        sendSuccess(res, result);
    } catch (err) {
        next(err);
    }
}

// ─── SarkariResult Pipeline Controllers ─────────────────────────

// POST /api/v1/scraper/sarkariresult/pipeline (Async, 202)
export async function triggerSarkariResultPipeline(req: Request, res: Response, next: NextFunction) {
    try {
        const body = (req.body || {}) as TriggerSarkariResultPipelineDto;
        logger.info('[Scraper] Triggered SarkariResult Home Pipeline (Async)');

        const pipelinePromise = SarkariResultPipeline.runPipeline(body);

        res.status(202).json({
            success: true,
            data: {
                message: 'SarkariResult Home scraping and deduplication pipeline started.',
                options: body,
            },
        });

        pipelinePromise.catch((err) => {
            logger.error(`[Scraper] SarkariResult background pipeline failed: ${err.message}`);
        });
    } catch (err) {
        next(err);
    }
}

// POST /api/v1/scraper/sarkariresult/pipeline/sync (Sync, 200)
export async function triggerSarkariResultPipelineSync(req: Request, res: Response, next: NextFunction) {
    try {
        const body = (req.body || {}) as TriggerSarkariResultPipelineDto;
        logger.info('[Scraper] Triggered SarkariResult Home Pipeline (Sync)');
        const summary = await SarkariResultPipeline.runPipeline(body);
        sendSuccess(res, summary, 200);
    } catch (err) {
        next(err);
    }
}

// POST /api/v1/scraper/sarkariresult/parse-url (Direct URL Test, No LLM)
export async function parseSarkariResultUrl(req: Request, res: Response, next: NextFunction) {
    try {
        const { url, sectionHint } = req.body as ParseSarkariResultUrlDto;
        logger.info(`[Scraper] Parsing SarkariResult URL without LLM: ${url}`);
        const html = await ScraperUtils.fetchHtml(url);
        const structured = await SarkariResultParser.parseDetailPage(html, url, sectionHint);
        sendSuccess(res, structured, 200);
    } catch (err) {
        next(err);
    }
}

// GET /api/v1/scraper/sarkariresult/preview-home (Preview sections with DB deduplication status)
export async function previewSarkariResultHome(req: Request, res: Response, next: NextFunction) {
    try {
        const sectionsParam = req.query.sections as string | undefined;
        const filterSections = sectionsParam ? sectionsParam.split(',').map((s) => s.trim()) : undefined;
        const scope = (req.query.scope as 'HOME' | 'SECTIONS' | 'ALL') || 'ALL';

        const entries = await SarkariResultPipeline.scrapeAllListingEntries({
            sourceScope: scope,
            sections: filterSections,
        });

        // Check deduplication state for preview
        const slugs = entries.map((e) => e.slug);
        const existingExams = await prisma.exam.findMany({
            where: { slug: { in: slugs } },
            select: { id: true, slug: true, status: true, title: true },
        });
        const existingStaged = await prisma.stagedExam.findMany({
            where: { slug: { in: slugs } },
            select: { id: true, slug: true, reviewStatus: true, title: true },
        });

        const examMap = new Map(existingExams.map((e) => [e.slug, e]));
        const stagedMap = new Map(existingStaged.map((s) => [s.slug, s]));

        const preview = entries.map((entry) => {
            const approved = examMap.get(entry.slug);
            const staged = stagedMap.get(entry.slug);

            let statusInDb: 'APPROVED_EXAM' | 'PENDING_STAGED' | 'NEW' = 'NEW';
            if (approved) statusInDb = 'APPROVED_EXAM';
            else if (staged) statusInDb = 'PENDING_STAGED';

            return {
                ...entry,
                statusInDb,
                existingExamId: approved?.id,
                stagedExamId: staged?.id,
            };
        });

        sendSuccess(res, {
            totalEntries: preview.length,
            scope,
            sectionsScanned: ['results', 'admit_cards', 'latest_jobs', 'answer_key'],
            entries: preview,
        });
    } catch (err) {
        next(err);
    }
}

// GET /api/v1/scraper/sarkariresult/rules
export async function getSarkariResultRules(req: Request, res: Response, next: NextFunction) {
    try {
        const rules = RuleEngineService.getRules();
        sendSuccess(res, rules);
    } catch (err) {
        next(err);
    }
}

// PUT /api/v1/scraper/sarkariresult/rules
export async function updateSarkariResultRules(req: Request, res: Response, next: NextFunction) {
    try {
        const newRules = req.body;
        if (!newRules || typeof newRules !== 'object') {
            sendError(res, 400, 'BAD_REQUEST', 'Invalid rules JSON payload');
            return;
        }
        RuleEngineService.updateRules(newRules);
        sendSuccess(res, { message: 'SarkariResult rules successfully updated and reloaded' });
    } catch (err) {
        next(err);
    }
}

// POST /api/v1/scraper/sarkariresult/sample-random (Sample balanced random exams via internal queue)
export async function runSarkariResultRandomSample(req: Request, res: Response, next: NextFunction) {
    try {
        const count = typeof req.body?.count === 'number' ? req.body.count : 10;
        const autoPromote = typeof req.body?.autoPromote === 'boolean' ? req.body.autoPromote : true;

        logger.info(`[Scraper] Executing random sample of ${count} exams (autoPromote: ${autoPromote}) via internal queue`);
        const result = await SarkariResultPipeline.runRandomSample(count, autoPromote);
        sendSuccess(res, result, 200);
    } catch (err) {
        next(err);
    }
}

// GET /api/v1/scraper/internal-queue/stats (In-memory queue stats and history)
export async function getInternalQueueStats(req: Request, res: Response, next: NextFunction) {
    try {
        const stats = internalScraperQueue.getStats();
        const history = internalScraperQueue.getHistory(30);
        sendSuccess(res, { stats, recentTasks: history }, 200);
    } catch (err) {
        next(err);
    }
}

// POST /api/v1/scraper/trending/sync (Evaluate & sync trending exams)
export async function syncTrendingExamsHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const count = typeof req.body?.count === 'number' ? req.body.count : 12;
        const result = await TrendingService.syncTrendingExams(count);
        sendSuccess(res, result, 200);
    } catch (err) {
        next(err);
    }
}



