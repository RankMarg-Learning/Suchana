// ============================================================
// src/middleware/validate.ts  — Zod request validation middleware
// ============================================================
import { Request, Response, NextFunction } from 'express';
import { z, ZodTypeAny, ZodError } from 'zod';
import { sendError } from '../utils/apiResponse';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Factory: Returns Express middleware that validates a specific part
 * of the request against the given Zod schema.
 */
export function validate(schema: ZodTypeAny, part: RequestPart = 'body') {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req[part]);
        if (!result.success) {
            const errors = (result.error as ZodError).flatten();
            sendError(res, 422, 'VALIDATION_ERROR', 'Invalid request data', errors);
            return;
        }

        Object.defineProperty(req, part, {
            value: result.data,
            writable: true,
            configurable: true,
            enumerable: true
        });

        next();
    };
}
