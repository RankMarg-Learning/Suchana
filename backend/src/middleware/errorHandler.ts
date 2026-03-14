import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

interface PrismaKnownError extends Error {
    code: string;
    meta?: { target?: string[] };
}

function isPrismaKnownError(err: unknown): err is PrismaKnownError {
    return (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        typeof (err as PrismaKnownError).code === 'string' &&
        (err as PrismaKnownError).code.startsWith('P')
    );
}

function isPrismaConnectionError(err: unknown): boolean {
    if (typeof err !== 'object' || err === null) return false;
    const name = (err as Error).name;
    return (
        name === 'PrismaClientInitializationError' ||
        name === 'PrismaClientConnectError' ||
        (err as Error).message.includes('Can\'t reach database server')
    );
}

export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    const error = err as Error;
    logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });

    if (err instanceof AppError) {
        sendError(res, err.statusCode, err.code, err.message, err.details);
        return;
    }

    if (err instanceof ZodError) {
        sendError(res, 422, 'VALIDATION_ERROR', 'Invalid request data', err.flatten());
        return;
    }

    if (isPrismaKnownError(err)) {
        if (err.code === 'P2002') {
            sendError(res, 409, 'CONFLICT', 'A record with this identifier already exists', {
                fields: err.meta?.target,
            });
            return;
        }
        if (err.code === 'P2025') {
            sendError(res, 404, 'NOT_FOUND', 'Record not found');
            return;
        }
        sendError(res, 400, 'DATABASE_ERROR', 'Database constraint violation', {
            prismaCode: err.code,
        });
        return;
    }

    if (isPrismaConnectionError(err)) {
        sendError(res, 503, 'DATABASE_CONNECTION_ERROR', 'Service temporarily unavailable: Database connection failed. Please try again in a few moments.');
        return;
    }

    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred');
}

export function notFoundHandler(req: Request, res: Response): void {
    sendError(res, 404, 'ROUTE_NOT_FOUND', `Cannot ${req.method} ${req.path}`);
}
