import { Router } from 'express';
import * as examController from '../controllers/exam.controller';
import * as lifecycleController from '../controllers/lifecycle.controller';
import { requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    createExamSchema,
    updateExamSchema,
    listExamQuerySchema,
    examIdParamSchema,
} from '../schemas/exam.schema';
import {
    createLifecycleEventSchema,
    updateLifecycleEventSchema,
} from '../schemas/lifecycle.schema';

const router = Router();

// ─── Public routes (Mobile app) ──────────────────────────────

// GET /api/v1/exams?page=1&limit=20&category=UPSC&status=ACTIVE
router.get('/', validate(listExamQuerySchema, 'query'), examController.listExams);

// GET /api/v1/exams/slug/:slug
router.get('/slug/:slug', examController.getExamBySlug);

// GET /api/v1/exams/:id
router.get('/:id', validate(examIdParamSchema, 'params'), examController.getExamById);

// GET /api/v1/exams/:id/timeline  (UC-04: User views exam timeline)
router.get('/:id/timeline', validate(examIdParamSchema, 'params'), lifecycleController.getTimeline);

// ─── Admin-only routes ────────────────────────────────────────

// POST /api/v1/exams  (UC-01: Admin creates exam)
router.post(
    '/',
    requireAdmin,
    validate(createExamSchema),
    examController.createExam
);

// PATCH /api/v1/exams/:id
router.patch(
    '/:id',
    requireAdmin,
    validate(examIdParamSchema, 'params'),
    validate(updateExamSchema),
    examController.updateExam
);

// DELETE /api/v1/exams/:id
router.delete(
    '/:id',
    requireAdmin,
    validate(examIdParamSchema, 'params'),
    examController.deleteExam
);

// ─── Lifecycle Event sub-routes  (UC-02) ──────────────────────

// POST /api/v1/exams/:id/events
router.post(
    '/:id/events',
    requireAdmin,
    validate(createLifecycleEventSchema),
    lifecycleController.addEvent
);

// PATCH /api/v1/exams/:id/events/:eventId
router.patch(
    '/:id/events/:eventId',
    requireAdmin,
    validate(updateLifecycleEventSchema),
    lifecycleController.updateEvent
);

// DELETE /api/v1/exams/:id/events/:eventId
router.delete(
    '/:id/events/:eventId',
    requireAdmin,
    lifecycleController.deleteEvent
);

export { router as examRouter };
