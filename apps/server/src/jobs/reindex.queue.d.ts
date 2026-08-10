import { PrismaClient } from '@prisma/client';
import type { EmbeddingsService } from '../modules/embeddings/services/embeddings.service.js';
export interface ReindexJobData {
    forceAll: boolean;
    batchSize: number;
    requestedAt: string;
}
export declare class ReindexQueue {
    private queue;
    private worker;
    private connection;
    private isRedisAvailable;
    private prisma;
    private embeddingsService?;
    constructor(redisUrl?: string, prisma?: PrismaClient, embeddingsService?: EmbeddingsService);
    /**
     * Adds a new re-indexing background job to the BullMQ queue (or in-memory fallback).
     */
    addReindexJob(data: {
        forceAll: boolean;
        batchSize: number;
    }): Promise<{
        jobId: string;
        queuedAt: Date;
    }>;
    /**
     * Processes the bulk vector re-indexing operation asynchronously.
     */
    private processReindexJob;
    /**
     * Retrieves current count of pending background jobs.
     */
    getPendingJobsCount(): Promise<number>;
    /**
     * Gracefully closes queue and worker connection handlers.
     */
    close(): Promise<void>;
}
//# sourceMappingURL=reindex.queue.d.ts.map