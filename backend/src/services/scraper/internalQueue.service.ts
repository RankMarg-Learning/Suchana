import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';

export interface InternalQueueTask<T = any, R = any> {
    id: string;
    name: string;
    data: T;
    execute: (data: T) => Promise<R>;
    priority?: number;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
    result?: R;
    error?: string;
    retries?: number;
    maxRetries?: number;
}

export interface InternalQueueStats {
    pending: number;
    active: number;
    completed: number;
    failed: number;
    total: number;
}

export class InternalQueueService extends EventEmitter {
    private queue: InternalQueueTask[] = [];
    private activeCount = 0;
    private concurrency: number;
    private delayMs: number;
    private minDelayMs: number;
    private maxDelayMs: number;
    private isRunning = false;
    private history: Map<string, InternalQueueTask> = new Map();
    private maxHistorySize = 200;

    constructor(concurrency = 2, delayMs = 600, minDelayMs = 600, maxDelayMs = 1400) {
        super();
        this.concurrency = concurrency;
        this.delayMs = delayMs;
        this.minDelayMs = minDelayMs;
        this.maxDelayMs = maxDelayMs;
    }

    /**
     * Dynamically updates the human pacing jitter bounds.
     */
    setPacing(minDelayMs: number, maxDelayMs: number): void {
        this.minDelayMs = Math.max(50, minDelayMs);
        this.maxDelayMs = Math.max(this.minDelayMs, maxDelayMs);
    }

    /**
     * Adds a task to the internal in-memory queue.
     */
    add<T, R>(
        name: string,
        data: T,
        execute: (data: T) => Promise<R>,
        options: { id?: string; priority?: number; maxRetries?: number } = {}
    ): string {
        const id = options.id || `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const task: InternalQueueTask<T, R> = {
            id,
            name,
            data,
            execute,
            priority: options.priority || 0,
            createdAt: new Date(),
            status: 'PENDING',
            retries: 0,
            maxRetries: options.maxRetries || 2,
        };

        // Insert in queue sorted by priority (higher priority first)
        const insertIdx = this.queue.findIndex((t) => (t.priority || 0) < (task.priority || 0));
        if (insertIdx === -1) {
            this.queue.push(task);
        } else {
            this.queue.splice(insertIdx, 0, task);
        }

        this.history.set(id, task);
        this.emit('taskAdded', task);
        logger.debug(`[InternalQueue] Task added: ${name} [${id}] (Queue size: ${this.queue.length})`);

        this.processNext();
        return id;
    }

    /**
     * Adds multiple tasks in batch and waits for all of them to settle.
     */
    async addBatchAndWait<T, R>(
        tasks: { name: string; data: T; execute: (data: T) => Promise<R>; priority?: number }[]
    ): Promise<InternalQueueTask<T, R>[]> {
        const taskIds = tasks.map((t) => this.add(t.name, t.data, t.execute, { priority: t.priority }));

        return new Promise((resolve) => {
            const checkCompletion = () => {
                const pendingOrActive = taskIds.some((id) => {
                    const task = this.history.get(id);
                    return task && (task.status === 'PENDING' || task.status === 'ACTIVE');
                });

                if (!pendingOrActive) {
                    this.removeListener('taskCompleted', checkCompletion);
                    this.removeListener('taskFailed', checkCompletion);
                    const results = taskIds.map((id) => this.history.get(id)! as InternalQueueTask<T, R>);
                    resolve(results);
                }
            };

            this.on('taskCompleted', checkCompletion);
            this.on('taskFailed', checkCompletion);
            checkCompletion();
        });
    }

    /**
     * Processes queue workers up to concurrency limit.
     */
    private async processNext(): Promise<void> {
        if (this.activeCount >= this.concurrency || this.queue.length === 0) {
            return;
        }

        const task = this.queue.shift();
        if (!task) return;

        this.activeCount++;
        task.status = 'ACTIVE';
        task.startedAt = new Date();
        this.emit('taskStarted', task);

        (async () => {
            try {
                logger.info(`[InternalQueue] Running task: ${task.name} [${task.id}]`);
                const result = await task.execute(task.data);
                task.status = 'COMPLETED';
                task.result = result;
                task.completedAt = new Date();
                this.emit('taskCompleted', task);
                logger.info(`[InternalQueue] Task completed: ${task.name} [${task.id}]`);
            } catch (err: any) {
                logger.error(`[InternalQueue] Task failed: ${task.name} [${task.id}]: ${err.message}`);
                if ((task.retries || 0) < (task.maxRetries || 2)) {
                    task.retries = (task.retries || 0) + 1;
                    logger.warn(`[InternalQueue] Retrying task ${task.name} (Attempt ${task.retries})`);
                    this.queue.unshift(task); // Re-queue at the front
                } else {
                    task.status = 'FAILED';
                    task.error = err.message;
                    task.completedAt = new Date();
                    this.emit('taskFailed', task);
                }
            } finally {
                this.activeCount--;
                const waitTime = (this.minDelayMs && this.maxDelayMs && this.maxDelayMs >= this.minDelayMs)
                    ? Math.floor(Math.random() * (this.maxDelayMs - this.minDelayMs + 1)) + this.minDelayMs
                    : this.delayMs;

                if (waitTime > 0) {
                    await new Promise((r) => setTimeout(r, waitTime));
                }
                this.processNext();
            }
        })();

        // Try launching next worker if concurrency allows
        this.processNext();
    }

    /**
     * Gets current queue statistics.
     */
    getStats(): InternalQueueStats {
        let pending = 0;
        let active = 0;
        let completed = 0;
        let failed = 0;

        for (const task of this.history.values()) {
            if (task.status === 'PENDING') pending++;
            else if (task.status === 'ACTIVE') active++;
            else if (task.status === 'COMPLETED') completed++;
            else if (task.status === 'FAILED') failed++;
        }

        return {
            pending,
            active,
            completed,
            failed,
            total: this.history.size,
        };
    }

    /**
     * Gets a snapshot of recent tasks.
     */
    getHistory(limit = 50): InternalQueueTask[] {
        return Array.from(this.history.values()).slice(-limit).reverse();
    }

    /**
     * Clears completed and failed history.
     */
    clearHistory(): void {
        for (const [id, task] of this.history.entries()) {
            if (task.status === 'COMPLETED' || task.status === 'FAILED') {
                this.history.delete(id);
            }
        }
    }
}

// Global Singleton internal queue for scrapers (2 workers, 600-1400ms human jitter)
export const internalScraperQueue = new InternalQueueService(2, 800, 600, 1400);
