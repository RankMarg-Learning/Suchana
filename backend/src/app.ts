import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { router } from './routes/index';
import { globalLimiter } from './middleware/rateLimiter';
import { preventParamPollution, secureHeaders } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

export function createApp(): Application {
    const app = express();

    app.set('trust proxy', 1);

    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin || env.CORS_ORIGINS.includes(origin) || !env.IS_PROD) {
                    callback(null, true);
                } else {
                    callback(new Error(`CORS policy: origin "${origin}" not allowed`));
                }
            },
            methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Admin-ID', 'X-Platform', 'X-User-ID', 'X-Requested-With'],
            credentials: true,
        })
    );

    app.use(helmet({
        contentSecurityPolicy: env.IS_PROD ? undefined : false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: "same-origin" },
        crossOriginResourcePolicy: { policy: "cross-origin" },
        dnsPrefetchControl: { allow: false },
        frameguard: { action: "deny" },
        hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }));

    app.use(globalLimiter);
    app.use(preventParamPollution);
    app.use(secureHeaders);

    app.use(express.json({ limit: '200kb' }));
    app.use(express.urlencoded({ extended: true, limit: '200kb' }));

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
