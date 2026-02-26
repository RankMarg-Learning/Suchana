// ============================================================
// src/schemas/lifecycle.schema.ts  — Zod schemas for Lifecycle events
// ============================================================
import { z } from 'zod';
import { LifecycleEventType } from '../constants/enums';

// ─── Create Lifecycle Event ──────────────────────────────────
// ─── Base Schema ──────────────────────────────────────────────
const baseLifecycleEventSchema = z.object({
    stage: z.string().max(50).optional().nullable(),
    eventType: z.nativeEnum(LifecycleEventType),
    title: z.string().min(3).max(200),
    description: z.string().optional().nullable(),
    startsAt: z.coerce.date().optional().nullable(),
    endsAt: z.coerce.date().optional().nullable(),
    isTBD: z.boolean().default(false),
    isConfirmed: z.boolean().default(true),
    actionUrl: z.string().url().or(z.literal('')).optional().nullable(),
    actionLabel: z.string().max(50).optional().nullable(),
});

// ─── Create Lifecycle Event ──────────────────────────────────
export const createLifecycleEventSchema = baseLifecycleEventSchema.refine(
    (data) => {
        if (data.isTBD) return true;
        return !!data.startsAt;
    },
    { message: 'startsAt is required if not TBD', path: ['startsAt'] }
).refine(
    (data) => {
        if (!data.startsAt || !data.endsAt) return true;
        return data.endsAt >= data.startsAt;
    },
    { message: 'endsAt must be after startsAt', path: ['endsAt'] }
);

// ─── Update Lifecycle Event ──────────────────────────────────
export const updateLifecycleEventSchema = baseLifecycleEventSchema.partial();

// ─── Params ─────────────────────────────────────────────────
export const lifecycleIdParamSchema = z.object({
    id: z.string().min(1),
    eventId: z.string().min(1),
});

export const lifecycleListQuerySchema = z.object({
    type: z.nativeEnum(LifecycleEventType).optional(),
    fromDate: z.coerce.date().optional(),
    toDate: z.coerce.date().optional(),
});

export type CreateLifecycleEventDto = z.infer<typeof createLifecycleEventSchema>;
export type UpdateLifecycleEventDto = z.infer<typeof updateLifecycleEventSchema>;
