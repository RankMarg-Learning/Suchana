// ============================================================
// src/routes/index.ts  — Central router
// ============================================================
import { Router } from 'express';
import { examRouter } from './exam.routes';
import { pushTokenRouter } from './pushToken.routes';
import { healthRouter } from './health.routes';
import { userRouter } from './user.routes';
import { scraperRouter } from './scraper.routes';
import { configRouter } from './config.routes';
import { env } from '../config/env';

import { seoRouter } from './seo.routes';
import { eventsRouter } from './events.routes';
import { tagRouter } from './tag.routes';

const router = Router();
const v = env.API_VERSION; // "v1"

router.use(`/api/${v}/health`, healthRouter);
router.use(`/api/${v}/exams`, examRouter);
router.use(`/api/${v}/events`, eventsRouter);
router.use(`/api/${v}/push-tokens`, pushTokenRouter);
router.use(`/api/${v}/users`, userRouter);
router.use(`/api/${v}/scraper`, scraperRouter);
router.use(`/api/${v}/config`, configRouter);
router.use(`/api/${v}/seo-pages`, seoRouter);
router.use(`/api/${v}/tags`, tagRouter);

export { router };
