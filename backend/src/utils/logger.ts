import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, json, colorize, simple, errors, printf } = winston.format;

/**
 * Filter sensitive fields from log messages.
 */
const maskFields = winston.format((info) => {
    const sensitive = ['phone', 'email', 'apiKey', 'password', 'token', 'authorization'];
    if (info.message && typeof info.message === 'object') {
        const obj = { ...info.message } as any;
        sensitive.forEach(field => {
            if (obj[field]) obj[field] = '*****';
        });
        info.message = obj;
    }
    // Deep search in info object
    const mask = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        sensitive.forEach(field => {
            if (obj[field]) obj[field] = '*****';
        });
        Object.values(obj).forEach(val => mask(val));
    };
    mask(info);
    return info;
});

const devFormat = combine(
    colorize({ all: true }),
    timestamp({ format: 'HH:mm:ss' }),
    errors({ stack: true }),
    simple()
);

const prodFormat = combine(
    maskFields(),
    timestamp(),
    errors({ stack: true }),
    json()
);

export const logger = winston.createLogger({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: env.IS_PROD ? prodFormat : devFormat,
    transports: [
        new winston.transports.Console(),
    ],
});
