import ioredisModule from 'ioredis';
import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
const RedisClient = ioredisModule.default || ioredisModule;
export class ReindexQueue {
    queue = null;
    worker = null;
    connection = null;
    isRedisAvailable = false;
    prisma;
    embeddingsService;
    constructor(redisUrl, prisma, embeddingsService) {
        this.prisma = prisma || new PrismaClient();
        this.embeddingsService = embeddingsService;
        const connectionUrl = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
        try {
            this.connection = new RedisClient(connectionUrl, {
                maxRetriesPerRequest: null,
                enableOfflineQueue: false,
                connectTimeout: 1000,
                lazyConnect: true,
            });
            this.connection.on('error', () => {
                this.isRedisAvailable = false;
            });
            this.connection.on('connect', () => {
                this.isRedisAvailable = true;
                console.log('[ReindexQueue] Connected to Redis server for BullMQ.');
            });
            // Connect asynchronously without crashing if Redis server is offline
            this.connection.connect().catch(() => {
                this.isRedisAvailable = false;
            });
            this.queue = new Queue('reindex-embeddings-queue', {
                connection: this.connection,
            });
            this.worker = new Worker('reindex-embeddings-queue', async (job) => {
                await this.processReindexJob(job.data);
            }, { connection: this.connection });
            this.worker.on('completed', (job) => {
                console.log(`[ReindexQueue] Job ${job.id} completed successfully.`);
            });
            this.worker.on('failed', (job, err) => {
                console.error(`[ReindexQueue] Job ${job?.id} failed: ${err.message}`);
            });
            this.worker.on('error', () => {
                this.isRedisAvailable = false;
            });
        }
        catch {
            this.isRedisAvailable = false;
        }
    }
    /**
     * Adds a new re-indexing background job to the BullMQ queue (or in-memory fallback).
     */
    async addReindexJob(data) {
        const timestamp = new Date();
        const jobId = `reindex-job-${Date.now()}`;
        if (this.isRedisAvailable && this.queue) {
            try {
                await this.queue.add('reindex-embeddings', {
                    forceAll: data.forceAll,
                    batchSize: data.batchSize,
                    requestedAt: timestamp.toISOString(),
                }, { jobId });
                console.log(`[ReindexQueue] Enqueued BullMQ re-indexing job: ${jobId}`);
                return { jobId, queuedAt: timestamp };
            }
            catch (err) {
                console.warn(`[ReindexQueue] Failed to add job to BullMQ (${err.message}). Fallback to async execution.`);
            }
        }
        // In-Memory Fallback: Process asynchronously in background
        setTimeout(async () => {
            try {
                await this.processReindexJob({
                    forceAll: data.forceAll,
                    batchSize: data.batchSize,
                    requestedAt: timestamp.toISOString(),
                });
            }
            catch (err) {
                console.error(`[ReindexQueue] In-memory job ${jobId} failed: ${err.message}`);
            }
        }, 10);
        return { jobId, queuedAt: timestamp };
    }
    /**
     * Processes the bulk vector re-indexing operation asynchronously.
     */
    async processReindexJob(data) {
        const batchSize = data.batchSize || 50;
        console.log(`[ReindexQueue] Processing re-index batch: forceAll=${data.forceAll}, batchSize=${batchSize}`);
        const patents = await this.prisma.patent.findMany({
            take: batchSize,
            select: { id: true, title: true, abstract: true, claims: true },
        });
        if (this.embeddingsService && patents.length > 0) {
            for (const patent of patents) {
                const claimsStr = Array.isArray(patent.claims) ? patent.claims.join('\n') : String(patent.claims || '');
                await this.embeddingsService.generatePatentDocumentEmbeddings({
                    title: patent.title,
                    abstract: patent.abstract,
                    claims: claimsStr,
                    keywords: [],
                    fullText: `${patent.title}\n${patent.abstract}\n${claimsStr}`,
                });
            }
        }
        console.log(`[ReindexQueue] Re-indexing completed for ${patents.length} patents.`);
    }
    /**
     * Retrieves current count of pending background jobs.
     */
    async getPendingJobsCount() {
        if (this.isRedisAvailable && this.queue) {
            try {
                const counts = await this.queue.getJobCounts('wait', 'active', 'delayed');
                return (counts.wait || 0) + (counts.active || 0) + (counts.delayed || 0);
            }
            catch {
                return 0;
            }
        }
        return 0;
    }
    /**
     * Gracefully closes queue and worker connection handlers.
     */
    async close() {
        try {
            if (this.worker) {
                await this.worker.close();
            }
            if (this.queue) {
                await this.queue.close();
            }
            if (this.connection) {
                await this.connection.quit().catch(() => { });
            }
        }
        catch {
            // Ignore cleanup errors
        }
    }
}
//# sourceMappingURL=reindex.queue.js.map