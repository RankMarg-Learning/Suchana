// ============================================================
// src/middleware/auth.ts  — Admin API key guard
// ============================================================
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { sendError } from '../utils/apiResponse';

/**
 * Simple API key authentication for admin routes.
 * In production, replace this with a proper JWT / OAuth2 guard.
 * The admin user ID is expected to be passed in the X-Admin-ID header.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const adminId = "papa"

    const apiKey = authHeader?.split(' ')[1] as string;

    if (!apiKey || apiKey !== env.API_KEY_SECRET) {
        console.log(apiKey);
        sendError(res, 401, 'UNAUTHORIZED', 'Valid API key required in Authorization: Bearer <token> header');
        return;
    }


    // Attach to request for downstream use
    (req as Request & { adminId: string }).adminId = adminId.trim();

    next();
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            adminId?: string;
        }
    }
}
