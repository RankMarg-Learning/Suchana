import { redis } from '../config/redis';
import { logger } from './logger';

export class CacheService {
    private prefix: string;

    constructor(prefix = 'exam_suchana') {
        this.prefix = prefix;
    }

    private key(k: string): string {
        return `${this.prefix}:${k}`;
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const raw = await redis.get(this.key(key));
            return raw ? (JSON.parse(raw) as T) : null;
        } catch (err) {
            logger.warn('Cache GET error', { key, error: (err as Error).message });
            return null;
        }
    }

    async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
        try {
            await redis.setex(this.key(key), ttlSeconds, JSON.stringify(value));
        } catch (err) {
            logger.warn('Cache SET error', { key, error: (err as Error).message });
        }
    }

    async del(key: string): Promise<void> {
        try {
            await redis.del(this.key(key));
        } catch (err) {
            logger.warn('Cache DEL error', { key, error: (err as Error).message });
        }
    }

    /** Delete all keys matching a pattern — e.g. invalidate all exam-list cache */
    async delPattern(pattern: string): Promise<number> {
        try {
            const fullPattern = `${this.prefix}:${pattern}`;
            const keys = await redis.keys(fullPattern);
            if (keys.length === 0) return 0;
            await redis.del(...keys);
            logger.debug(`Cache FLUSH: deleted ${keys.length} keys matching "${fullPattern}"`);
            return keys.length;
        } catch (err) {
            logger.warn('Cache FLUSH error', { pattern, error: (err as Error).message });
            return 0;
        }
    }

    /** Cache-aside wrapper: get from cache or compute and store */
    async getOrSet<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== null) return cached;
        const value = await fn();
        await this.set(key, value, ttl);
        return value;
    }
}

// Singleton instance
export const cacheService = new CacheService('exam_suchana');
