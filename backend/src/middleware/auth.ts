import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { sendError } from '../utils/apiResponse';


export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const adminId = "papa"

    const apiKey = authHeader?.split(' ')[1] as string;

    if (!apiKey || apiKey !== env.API_KEY_SECRET) {
        console.log(apiKey);
        sendError(res, 401, 'UNAUTHORIZED', 'Valid API key required in Authorization: Bearer <token> header');
        return;
    }

    (req as Request & { adminId: string }).adminId = adminId.trim();

    next();
}

declare global {
    namespace Express {
        interface Request {
            adminId?: string;
        }
    }
}
