import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { router } from './routes/index';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

export function createApp(): Application {
    const app = express();

    app.use(helmet());

    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin || env.CORS_ORIGINS.includes(origin) || !env.IS_PROD) {
                    callback(null, true);
                } else {
                    callback(new Error(`CORS policy: origin "${origin}" not allowed`));
                }
            },
            methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'X-API-Key', 'X-Admin-ID'],
            credentials: false,
        })
    );

    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true }));

    app.use(
        morgan(env.IS_PROD ? 'combined' : 'dev', {
            stream: { write: (msg) => logger.http(msg.trim()) },
        })
    );

    app.use(router);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
