// ============================================================
// src/schemas/scraper.schema.ts
// Zod schemas for scraper + review endpoints
// ============================================================
import { z } from 'zod';
import {
    EXAM_CATEGORIES,
    EXAM_LEVELS,
    LIFECYCLE_STAGES,
    LIFECYCLE_EVENT_TYPES,
    REVIEW_STATUSES,
    ReviewStatus,
} from '../constants/enums';

// ─── ScrapeSource ─────────────────────────────────────────────
export const createScrapeSourceSchema = z.object({
    url: z.string().url('Must be a valid URL'),
    label: z.string().min(2).max(200),
    sourceType: z.enum(['LISTING', 'DETAIL']).default('LISTING'),
    hintCategory: z.enum(EXAM_CATEGORIES as unknown as [string, ...string[]]).optional(),
    selectorHints: z.record(z.unknown()).optional(),
    isActive: z.boolean().default(true),
});
export type CreateScrapeSourceDto = z.infer<typeof createScrapeSourceSchema>;

export const updateScrapeSourceSchema = createScrapeSourceSchema.partial();
export type UpdateScrapeSourceDto = z.infer<typeof updateScrapeSourceSchema>;

export const listScrapeSourceQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    isActive: z.coerce.boolean().optional(),
    sourceType: z.enum(['LISTING', 'DETAIL']).optional(),
});
export type ListScrapeSourceQuery = z.infer<typeof listScrapeSourceQuerySchema>;

export const triggerScrapeSchema = z.object({
    sourceId: z.string().cuid('Must be a valid source ID'),
});
export type TriggerScrapeDto = z.infer<typeof triggerScrapeSchema>;

const booleanFromQuery = z.preprocess((val) => {
    if (val === 'true' || val === true || val === '1' || val === 1) return true;
    if (val === 'false' || val === false || val === '0' || val === 0) return false;
    return undefined;
}, z.boolean().optional());

export const listStagedExamQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    reviewStatus: z.enum(REVIEW_STATUSES as unknown as [string, ...string[]]).optional(),
    isDuplicate: booleanFromQuery,
    category: z.enum(EXAM_CATEGORIES as unknown as [string, ...string[]]).optional(),
    scrapeJobId: z.string().optional(),
});
export type ListStagedExamQuery = z.infer<typeof listStagedExamQuerySchema>;


const correctionsSchema = z.object({
    title: z.string().optional(),
    shortTitle: z.string().optional(),
    conductingBody: z.string().optional(),
    category: z.enum(EXAM_CATEGORIES as unknown as [string, ...string[]]).optional(),
    examLevel: z.enum(EXAM_LEVELS as unknown as [string, ...string[]]).optional(),
    totalVacancies: z.number().int().optional(),
    description: z.string().optional(),
    officialWebsite: z.string().url().optional(),
    notificationUrl: z.string().url().optional(),
});

export const reviewDecisionSchema = z.object({
    decision: z.enum([
        ReviewStatus.APPROVED,
        ReviewStatus.REJECTED,
        ReviewStatus.NEEDS_CORRECTION,
    ]),
    reviewNote: z.string().max(2000).optional(),
    corrections: correctionsSchema.optional(),
});
export type ReviewDecisionDto = z.infer<typeof reviewDecisionSchema>;

export const updateStagedEventSchema = z.object({
    stage: z.enum(LIFECYCLE_STAGES as unknown as [string, ...string[]]).optional(),
    eventType: z.enum(LIFECYCLE_EVENT_TYPES as unknown as [string, ...string[]]).optional(),
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    startsAt: z.string().datetime().transform((d) => new Date(d)).optional().nullable(),
    endsAt: z.string().datetime().transform((d) => new Date(d)).optional().nullable(),
    isTBD: z.boolean().optional(),
    isImportant: z.boolean().optional(),
    actionUrl: z.string().url().optional().nullable(),
    actionLabel: z.string().optional().nullable(),
});
export type UpdateStagedEventDto = z.infer<typeof updateStagedEventSchema>;
