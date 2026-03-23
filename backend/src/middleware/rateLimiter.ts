import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { env } from '../config/env';
import { sendError } from '../utils/apiResponse';


export const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 150,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => {
        const userId = req.headers['x-user-id'] as string;
        const auth = req.headers['authorization'] as string;

        if (userId) return userId;
        if (auth) return auth;
        return ipKeyGenerator(req.ip || 'unknown');
    },
    message: (req: any, res: any) => {
        sendError(res, 429, 'TOO_MANY_REQUESTS', 'You have exceeded the request limit. Please try again later.');
    },
    skip: (req) => !env.IS_PROD,
});


export const registrationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: (req: any, res: any) => {
        sendError(res, 429, 'TOO_MANY_REQUESTS', 'Too many registration attempts. Please try again in 5 minutes.');
    },
    skip: (req) => !env.IS_PROD,
});


export const sensitiveActionsLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: (req: any, res: any) => {
        sendError(res, 429, 'TOO_MANY_REQUESTS', 'Too many sensitive operations requested. Slow down.');
    },
    skip: (req) => !env.IS_PROD,
});
