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

    app.use(helmet({
        contentSecurityPolicy: env.IS_PROD ? undefined : false,
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        dnsPrefetchControl: { allow: false },
        frameguard: { action: "deny" },
        hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: { permittedPolicies: "none" },
        referrerPolicy: { policy: "no-referrer" },
        xssFilter: true,
    }));

    app.use(globalLimiter);

    app.use(preventParamPollution);
    app.use(secureHeaders);

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
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Admin-ID', 'X-Platform', 'X-User-ID'],
            credentials: false,
        })
    );

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
