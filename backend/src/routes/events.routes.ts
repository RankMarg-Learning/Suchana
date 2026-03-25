import { Router } from 'express';
import * as lifecycleController from '../controllers/lifecycle.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/v1/events (admin only - all upcoming events)
router.get('/', requireAdmin, lifecycleController.getAllEvents);

export { router as eventsRouter };
