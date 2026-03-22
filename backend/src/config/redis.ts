// ============================================================
// src/config/redis.ts  — IORedis client singleton
// ============================================================
import Redis from 'ioredis';
import { URL } from 'url';
import { env } from './env';
import { logger } from '../utils/logger';

const commonOptions = {
    maxRetriesPerRequest: null, // BullMQ requirement
    retryStrategy: (times: number) => Math.min(times * 100, 3000),
    enableReadyCheck: true,
    lazyConnect: false,
    family: 4, // Force IPv4 to avoid ENOTFOUND issues on some setups
};

// Main client (cache)
// @ts-ignore - specialized overload with string url
export const redis = env.REDIS_URL
    ? new Redis(env.REDIS_URL, commonOptions)
    : new Redis({
        ...commonOptions,
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD || undefined,
        db: env.REDIS_DB,
    });

redis.on('connect', () => logger.info('Redis: connected'));
redis.on('ready', () => logger.info('Redis: ready'));
redis.on('error', (err) => logger.error('Redis error', { error: err.message }));
redis.on('close', () => logger.warn('Redis: connection closed'));

// BullMQ connection configuration
export const bullRedisConnection = (() => {
    if (env.REDIS_URL) {
        const url = new URL(env.REDIS_URL);
        const isTls = url.protocol === 'rediss:';

        return {
            host: url.hostname,
            port: Number(url.port) || 6379,
            password: url.password || undefined,
            username: url.username || undefined,
            db: Number(url.pathname.slice(1)) || 0,
            tls: isTls ? {} : undefined,
            family: 4,
        };
    }

    return {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD || undefined,
        db: env.REDIS_DB,
    };
})();
