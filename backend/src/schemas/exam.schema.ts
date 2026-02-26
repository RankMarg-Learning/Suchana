// ============================================================
// src/schemas/exam.schema.ts  — Zod schemas for Exam endpoints
// ============================================================
import { z } from 'zod';
import { ExamCategory, ExamStatus, ExamLevel } from '../constants/enums';

// ─── Create Exam ────────────────────────────────────────────
export const createExamSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    shortTitle: z.string().min(2).max(50),
    description: z.string().optional().nullable(),
    category: z.nativeEnum(ExamCategory),
    examLevel: z.nativeEnum(ExamLevel).default(ExamLevel.NATIONAL),
    state: z.string().max(50).optional().nullable(),
    conductingBody: z.string().min(2).max(100),
    minAge: z.number().int().positive().optional().nullable(),
    maxAge: z.number().int().positive().optional().nullable(),
    qualificationCriteria: z.any().optional().nullable(), // Will be structured JSON
    totalVacancies: z.number().int().positive().optional().nullable(),
    applicationFee: z.record(z.string(), z.number()).optional().nullable(),
    officialWebsite: z.string().url().or(z.literal('')).optional().nullable(),
    notificationUrl: z.string().url().or(z.literal('')).optional().nullable(),
    isPublished: z.boolean().default(false),
});

// ─── Update Exam ────────────────────────────────────────────
export const updateExamSchema = createExamSchema
    .partial()
    .extend({
        status: z.nativeEnum(ExamStatus).optional(),
    });

// ─── List Exams Query ────────────────────────────────────────
export const listExamQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    category: z.nativeEnum(ExamCategory).optional(),
    status: z.nativeEnum(ExamStatus).optional(),
    conductingBody: z.string().optional(),
    search: z.string().optional(),
    isPublished: z.string().transform((v) => v === 'true').pipe(z.boolean()).optional(),
    examLevel: z.nativeEnum(ExamLevel).optional(),
    state: z.string().optional(),
});

// ─── Exam ID param ──────────────────────────────────────────
export const examIdParamSchema = z.object({
    id: z.string().min(1, 'Exam ID is required'),
});

export type CreateExamDto = z.infer<typeof createExamSchema>;
export type UpdateExamDto = z.infer<typeof updateExamSchema>;
export type ListExamQuery = z.infer<typeof listExamQuerySchema>;
