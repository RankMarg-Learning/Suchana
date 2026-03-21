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
} from '../schemas/scraper.schema';


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
        }

        const { text, charCount, extractedLinks } = ScraperUtils.cleanHtml(htmlToProcess, url);
        const extracted = await AIProvider.extractExamData(text, url, hintCategory);

        if (!extracted) {
            sendError(res, 500, 'AI_FAILED', 'AI failed to extract data');
            return;
        }

        extracted.sourceUrl = url;
        extracted.scrapedAt = new Date();
        sendSuccess(res, extracted);
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
