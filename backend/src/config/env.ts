// ============================================================
// src/config/env.ts  — Typed environment configuration
// ============================================================
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('8080'),
    API_VERSION: z.string().default('v1'),

    DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

    REDIS_URL: z.string().url().optional(),
    REDIS_HOST: z.string().default('127.0.0.1'),
    REDIS_PORT: z.string().default('6379'),
    REDIS_PASSWORD: z.string().default(''),
    REDIS_DB: z.string().default('0'),

    CACHE_TTL_EXAM_LIST: z.string().default('300'),
    CACHE_TTL_EXAM_DETAIL: z.string().default('600'),
    CACHE_TTL_TIMELINE: z.string().default('300'),

    FCM_PROJECT_ID: z.string().optional(),
    FCM_CLIENT_EMAIL: z.string().optional(),
    FCM_PRIVATE_KEY: z.string().optional(),

    NOTIFICATION_WORKER_CRON: z.string().default('*/5 * * * *'),
    NOTIFICATION_LEAD_TIME_HOURS: z.string().default('24'),

    API_KEY_SECRET: z.string().min(16, 'API_KEY_SECRET must be at least 16 characters'),
    CORS_ORIGINS: z.string().default('http://localhost:3000'),

    OPENAI_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:\n', parsed.error.format());
    process.exit(1);
}

export const env = {
    ...parsed.data,
    PORT: parseInt(parsed.data.PORT, 10),
    REDIS_PORT: parseInt(parsed.data.REDIS_PORT, 10),
    REDIS_DB: parseInt(parsed.data.REDIS_DB, 10),
    CACHE_TTL_EXAM_LIST: parseInt(parsed.data.CACHE_TTL_EXAM_LIST, 10),
    CACHE_TTL_EXAM_DETAIL: parseInt(parsed.data.CACHE_TTL_EXAM_DETAIL, 10),
    CACHE_TTL_TIMELINE: parseInt(parsed.data.CACHE_TTL_TIMELINE, 10),
    NOTIFICATION_LEAD_TIME_HOURS: parseInt(parsed.data.NOTIFICATION_LEAD_TIME_HOURS, 10),
    CORS_ORIGINS: parsed.data.CORS_ORIGINS.split(',').map((o) => o.trim()),
    IS_PROD: parsed.data.NODE_ENV === 'production',
};
