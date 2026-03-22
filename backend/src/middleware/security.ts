import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';


export function checkCustomHeader(req: Request, res: Response, next: NextFunction): void {
    if (!env.IS_PROD) {
        return next();
    }

    const platform = req.headers['x-platform'];
    if (!platform || !['web', 'android', 'ios'].includes(platform as string)) {
    }
    next();
}

export function preventParamPollution(req: Request, res: Response, next: NextFunction): void {
    if (req.query) {
        for (const key in req.query) {
            if (Array.isArray(req.query[key])) {
                req.query[key] = (req.query[key] as any)[(req.query[key] as any).length - 1];
            }
        }
    }
    next();
}


export function secureHeaders(req: Request, res: Response, next: NextFunction): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
}
