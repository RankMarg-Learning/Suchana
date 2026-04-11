import { z } from 'zod';
import { ExamCategory, ExamStatus, ExamLevel } from '../constants/enums';

export const createExamSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    shortTitle: z.string().min(2),
    description: z.string().optional().nullable(),
    category: z.nativeEnum(ExamCategory),
    examLevel: z.nativeEnum(ExamLevel).default(ExamLevel.NATIONAL),
    state: z.string().max(50).optional().nullable(),
    conductingBody: z.string().min(2),
    age: z.string().optional().nullable(),
    qualificationCriteria: z.string().optional().nullable(),
    totalVacancies: z.string().optional().nullable(),
    applicationFee: z.string().optional().nullable(),
    salary: z.string().optional().nullable(),
    additionalDetails: z.string().optional().nullable(),
    officialWebsite: z.string().url().or(z.literal('')).optional().nullable(),
    notificationUrl: z.string().url().or(z.literal('')).optional().nullable(),
    status: z.nativeEnum(ExamStatus).default(ExamStatus.NOTIFICATION),
    isPublished: z.boolean().default(false),
    isTrending: z.boolean().default(false),
    createdAt: z.string().optional().nullable(),
});

export const updateExamSchema = createExamSchema.partial();

export const listExamQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    category: z.nativeEnum(ExamCategory).optional(),
    status: z.string().optional(),
    conductingBody: z.string().optional(),
    search: z.string().optional(),
    isPublished: z.string().transform((v) => v === 'true').pipe(z.boolean()).optional(),
    isTrending: z.string().transform((v) => v === 'true').pipe(z.boolean()).optional(),
    examLevel: z.nativeEnum(ExamLevel).optional(),
    state: z.string().optional(),
    lifecycleStage: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export const examIdParamSchema = z.object({
    id: z.string().min(1, 'Exam ID is required'),
});

export type CreateExamDto = z.infer<typeof createExamSchema>;
export type UpdateExamDto = z.infer<typeof updateExamSchema>;
export type ListExamQuery = z.infer<typeof listExamQuerySchema>;
