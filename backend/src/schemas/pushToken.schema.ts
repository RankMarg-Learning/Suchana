// ============================================================
// src/schemas/pushToken.schema.ts  — Zod schemas for push tokens
// ============================================================
import { z } from 'zod';
import { PushPlatform } from '../constants/enums';

export const registerPushTokenSchema = z.object({
    userId: z.string().min(1, 'userId is required'),
    token: z.string().min(10, 'token is required'),
    platform: z.nativeEnum(PushPlatform),
    deviceModel: z.string().max(100).optional().nullable(),
    appVersion: z.string().max(20).optional().nullable(),
});

export const deactivatePushTokenSchema = z.object({
    token: z.string().min(10),
});

export type RegisterPushTokenDto = z.infer<typeof registerPushTokenSchema>;
