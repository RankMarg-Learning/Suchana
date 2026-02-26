// ============================================================
// src/routes/health.routes.ts  — Health check endpoint
// ============================================================
import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { redis } from '../config/redis';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
    const status = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            database: 'unknown',
            redis: 'unknown',
        },
    };

    try {
        await prisma.$queryRaw`SELECT 1`;
        status.services.database = 'ok';
    } catch {
        status.services.database = 'error';
    }

    try {
        await redis.ping();
        status.services.redis = 'ok';
    } catch {
        status.services.redis = 'error';
    }

    const isDegraded =
        status.services.database === 'error' || status.services.redis === 'error';

    res.status(isDegraded ? 503 : 200).json(status);
});

export { router as healthRouter };
