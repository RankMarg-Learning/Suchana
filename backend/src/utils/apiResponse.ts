// ============================================================
// src/utils/apiResponse.ts  — Standardized JSON response helpers
// ============================================================
import { Response } from 'express';

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export function sendSuccess<T>(
    res: Response,
    data: T,
    statusCode = 200,
    meta?: Record<string, unknown>
): void {
    const body: ApiSuccessResponse<T> = { success: true, data };
    if (meta) body.meta = meta;
    res.status(statusCode).json(body);
}

export function sendError(
    res: Response,
    statusCode: number,
    code: string,
    message: string,
    details?: unknown
): void {
    const body: ApiErrorResponse = {
        success: false,
        error: { code, message, details },
    };
    res.status(statusCode).json(body);
}

// Pagination meta helper
export function buildPaginationMeta(
    total: number,
    page: number,
    limit: number
): Record<string, unknown> {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
    };
}
