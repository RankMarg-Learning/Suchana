// ============================================================
// src/routes/index.ts  — Central router
// ============================================================
import { Router } from 'express';
import { examRouter } from './exam.routes';
import { pushTokenRouter } from './pushToken.routes';
import { healthRouter } from './health.routes';
import { userRouter } from './user.routes';
import { scraperRouter } from './scraper.routes';
import { env } from '../config/env';

const router = Router();
const v = env.API_VERSION; // "v1"

router.use(`/api/${v}/health`, healthRouter);
router.use(`/api/${v}/exams`, examRouter);
router.use(`/api/${v}/push-tokens`, pushTokenRouter);
router.use(`/api/${v}/users`, userRouter);
router.use(`/api/${v}/scraper`, scraperRouter);

export { router };
