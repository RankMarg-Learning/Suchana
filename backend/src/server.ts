import { createApp } from './app';
import { env } from './config/env';

import { redis } from './config/redis';
import { startNotificationWorker } from './workers/notification.worker';
import { logger } from './utils/logger';

let worker: ReturnType<typeof startNotificationWorker> | null = null;

async function bootstrap(): Promise<void> {
    logger.info('🚀 Starting Government Exam Execution Platform Backend...');
    logger.info('✅ Database connected');

    await redis.ping();
    logger.info('✅ Redis connected');

    worker = startNotificationWorker();
    logger.info('✅ Notification worker started');

    const app = createApp();
    const server = app.listen(env.PORT, '0.0.0.0', () => {
        logger.info(`✅ Server listening on port ${env.PORT}`);
        logger.info(`   Host        : 0.0.0.0 (Accepting all connections)`);
        logger.info(`   Environment : ${env.NODE_ENV}`);
        logger.info(`   API base    : http://localhost:${env.PORT}/api/${env.API_VERSION}`);
        logger.info(`   Health      : http://localhost:${env.PORT}/api/${env.API_VERSION}/health`);
    });

    const shutdown = async (signal: string) => {
        logger.info(`${signal} received — shutting down gracefully...`);

        server.close(async () => {
            try {
                if (worker) await worker.close();
                await redis.quit();
                logger.info('✅ Graceful shutdown complete');
                process.exit(0);
            } catch (err) {
                logger.error('Error during shutdown', { error: (err as Error).message });
                process.exit(1);
            }
        });

        // Force shutdown after 10s
        setTimeout(() => {
            logger.error('Forced shutdown (timeout)');
            process.exit(1);
        }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
        logger.error('Unhandled promise rejection', { reason });
    });

    process.on('uncaughtException', (err) => {
        logger.error('Uncaught exception', { error: err.message, stack: err.stack });
        process.exit(1);
    });
}

bootstrap().catch((err: unknown) => {
    logger.error('Failed to start server', { error: (err as Error).message });
    process.exit(1);
});
