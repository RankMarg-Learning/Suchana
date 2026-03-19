import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as scraperController from '../controllers/scraper.controller';
import {
    createScrapeSourceSchema,
    updateScrapeSourceSchema,
    listScrapeSourceQuerySchema,
    triggerScrapeSchema,
    listStagedExamQuerySchema,
    reviewDecisionSchema,
    updateStagedEventSchema,
    createStagedEventSchema,
} from '../schemas/scraper.schema';

const router = Router();

router.use(requireAdmin);

// ─── Stats dashboard ────────────────────────────────────────────
// GET /api/v1/scraper/stats
router.get('/stats', scraperController.getReviewStats);

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
router.post('/trigger', validate(triggerScrapeSchema), scraperController.triggerScrape);

// POST /api/v1/scraper/trigger/sync   → synchronous (waits for result)
router.post('/trigger/sync', validate(triggerScrapeSchema), scraperController.triggerScrapeSync);

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
