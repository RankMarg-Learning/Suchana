import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { redis } from '../config/redis';
import { sendSuccess } from '../utils/apiResponse';
import * as scraperController from '../controllers/scraper.controller';
import { registrationLimiter, sensitiveActionsLimiter } from '../middleware/rateLimiter';
import {
    createScrapeSourceSchema,
    updateScrapeSourceSchema,
    listScrapeSourceQuerySchema,
    triggerScrapeSchema,
    listStagedExamQuerySchema,
    reviewDecisionSchema,
    updateStagedEventSchema,
    createStagedEventSchema,
    extractTextSchema,
    extractJsonSchema,
    triggerSarkariResultPipelineSchema,
    parseSarkariResultUrlSchema,
} from '../schemas/scraper.schema';


const router = Router();

router.use(requireAdmin);

// ─── Stats dashboard ────────────────────────────────────────────
// GET /api/v1/scraper/stats
router.get('/stats', scraperController.getReviewStats);

// POST /api/v1/scraper/clear-cache
router.post('/clear-cache', async (req: Request, res: Response) => {
    await redis.flushall();
    sendSuccess(res, { message: 'Cache cleared successfully' });
});

// ─── ScrapeSource management ────────────────────────────────────
// GET  /api/v1/scraper/sources
router.get('/sources', validate(listScrapeSourceQuerySchema, 'query'), scraperController.listScrapeSources);

// GET  /api/v1/scraper/sources/:id
router.get('/sources/:id', scraperController.getScrapeSourceById);

// POST /api/v1/scraper/sources
router.post('/sources', validate(createScrapeSourceSchema), scraperController.createScrapeSource);

// PATCH /api/v1/scraper/sources/:id
router.patch('/sources/:id', validate(updateScrapeSourceSchema), scraperController.updateScrapeSource);

// DELETE /api/v1/scraper/sources/:id
router.delete('/sources/:id', scraperController.deleteScrapeSource);

// ─── Scrape Job management ──────────────────────────────────────
// GET /api/v1/scraper/jobs?sourceId=xxx&limit=50
router.get('/jobs', scraperController.listScrapeJobs);

// GET /api/v1/scraper/jobs/:id
router.get('/jobs/:id', scraperController.getScrapeJobById);

// ─── Trigger scrape ─────────────────────────────────────────────
// POST /api/v1/scraper/trigger        → async (fire-and-forget, 202)
router.post('/trigger', sensitiveActionsLimiter, validate(triggerScrapeSchema), scraperController.triggerScrape);

// POST /api/v1/scraper/trigger/sync   → synchronous (waits for result)
router.post('/trigger/sync', sensitiveActionsLimiter, validate(triggerScrapeSchema), scraperController.triggerScrapeSync);

// POST /api/v1/scraper/test-direct    → Direct URL test (Synchronous, no DB storage)
router.post('/test-direct', scraperController.testScraperDirect);

// POST /api/v1/scraper/extract-text  → Extract from raw text (Synchronous, creates StagedExam)
router.post('/extract-text', validate(extractTextSchema), scraperController.extractFromText);

// POST /api/v1/scraper/extract-json  → Bypass AI and extract directly from JSON (Synchronous, creates StagedExam)
router.post('/extract-json', validate(extractJsonSchema), scraperController.extractFromJson);

// ─── SarkariResult Dedicated Pipeline ───────────────────────────
// POST /api/v1/scraper/sarkariresult/pipeline        → async (fire-and-forget, 202)
router.post(
    '/sarkariresult/pipeline',
    sensitiveActionsLimiter,
    validate(triggerSarkariResultPipelineSchema),
    scraperController.triggerSarkariResultPipeline,
);

// POST /api/v1/scraper/sarkariresult/pipeline/sync   → synchronous (waits for summary, 200)
router.post(
    '/sarkariresult/pipeline/sync',
    sensitiveActionsLimiter,
    validate(triggerSarkariResultPipelineSchema),
    scraperController.triggerSarkariResultPipelineSync,
);

// POST /api/v1/scraper/sarkariresult/parse-url       → direct URL parse via JSON rules (No LLM)
router.post(
    '/sarkariresult/parse-url',
    validate(parseSarkariResultUrlSchema),
    scraperController.parseSarkariResultUrl,
);

// GET /api/v1/scraper/sarkariresult/preview-home     → preview home page entries & DB status
router.get(
    '/sarkariresult/preview-home',
    scraperController.previewSarkariResultHome,
);

// GET /api/v1/scraper/sarkariresult/rules            → fetch current JSON rules
router.get(
    '/sarkariresult/rules',
    scraperController.getSarkariResultRules,
);

// PUT /api/v1/scraper/sarkariresult/rules            → update JSON rules
router.put(
    '/sarkariresult/rules',
    scraperController.updateSarkariResultRules,
);

// POST /api/v1/scraper/sarkariresult/sample-random   → sample balanced random 10 exams via in-memory queue
router.post(
    '/sarkariresult/sample-random',
    sensitiveActionsLimiter,
    scraperController.runSarkariResultRandomSample,
);

// GET /api/v1/scraper/internal-queue/stats           → get in-memory queue status & stats (NO REDIS)
router.get(
    '/internal-queue/stats',
    scraperController.getInternalQueueStats,
);

// POST /api/v1/scraper/trending/sync                 → auto-evaluate, add & remove trending exams
router.post(
    '/trending/sync',
    sensitiveActionsLimiter,
    scraperController.syncTrendingExamsHandler,
);

// ─── Review pipeline ────────────────────────────────────────────
// GET  /api/v1/scraper/staged?reviewStatus=PENDING&page=1
router.get('/staged', validate(listStagedExamQuerySchema, 'query'), scraperController.listStagedExams);

// GET  /api/v1/scraper/staged/:id
router.get('/staged/:id', scraperController.getStagedExamById);

// POST /api/v1/scraper/staged/:id/review  { decision, reviewNote, corrections? }
router.post('/staged/:id/review', validate(reviewDecisionSchema), scraperController.reviewStagedExam);

// POST /api/v1/scraper/staged/:stagedExamId/events
router.post(
    '/staged/:stagedExamId/events',
    validate(createStagedEventSchema),
    scraperController.addStagedEvent,
);

// ─── Staged lifecycle event editing ─────────────────────────────
// PATCH /api/v1/scraper/staged/:stagedExamId/events/:eventId
router.patch(
    '/staged/:stagedExamId/events/:eventId',
    validate(updateStagedEventSchema),
    scraperController.updateStagedEvent,
);

// DELETE /api/v1/scraper/staged/:stagedExamId/events/:eventId
router.delete('/staged/:stagedExamId/events/:eventId', scraperController.deleteStagedEvent);

export { router as scraperRouter };
