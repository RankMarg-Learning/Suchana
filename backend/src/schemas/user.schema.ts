import { z } from 'zod';

export const registerUserSchema = z.object({
    name: z.string().min(1).max(100),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
    state: z.string().optional(),
    city: z.string().optional(),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    qualification: z.enum(['10TH_PASS', '12TH_PASS', 'GRADUATE', 'POST_GRADUATE', 'PHD', 'OTHER']).optional(),
    preferredCategories: z.array(z.string()).optional().default([]),
    preferredExamLevel: z.enum(['NATIONAL', 'STATE', 'BOTH']).optional(),
    savedExamIds: z.array(z.string()).optional().default([]),
    employmentStatus: z.enum(['STUDENT', 'EMPLOYED', 'UNEMPLOYED', 'OTHER']).optional(),
    languagePreference: z.enum(['HINDI', 'ENGLISH']).optional().default('HINDI'),
    notificationsEnabled: z.boolean().optional().default(true),
    fcmToken: z.string().optional(),
    platform: z.enum(['android', 'ios', 'web']).optional(),
    appVersion: z.string().optional(),
});

export const updateUserSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    qualification: z.enum(['10TH_PASS', '12TH_PASS', 'GRADUATE', 'POST_GRADUATE', 'PHD', 'OTHER']).optional(),
    preferredCategories: z.array(z.string()).optional(),
    preferredExamLevel: z.enum(['NATIONAL', 'STATE', 'BOTH']).optional(),
    savedExamIds: z.array(z.string()).optional(),
    employmentStatus: z.enum(['STUDENT', 'EMPLOYED', 'UNEMPLOYED', 'OTHER']).optional(),
    languagePreference: z.enum(['HINDI', 'ENGLISH']).optional(),
    notificationsEnabled: z.boolean().optional(),
    fcmToken: z.string().optional(),
    platform: z.enum(['android', 'ios', 'web']).optional(),
    appVersion: z.string().optional(),
});

export const userIdParamSchema = z.object({
    id: z.string().cuid(),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
