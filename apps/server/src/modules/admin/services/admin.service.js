import { PrismaClient } from '@prisma/client';
import { RedisCacheProvider } from '../../../providers/cache/redis-cache.provider.js';
import { ReindexQueue } from '../../../jobs/reindex.queue.js';
export class AdminService {
    vectorStoreProvider;
    llmProvider;
    embeddingsService;
    cacheProvider;
    prisma;
    reindexQueue;
    constructor(vectorStoreProvider, llmProvider, cacheProvider, prisma, embeddingsService, reindexQueue) {
        this.vectorStoreProvider = vectorStoreProvider;
        this.llmProvider = llmProvider;
        this.embeddingsService = embeddingsService;
        this.cacheProvider = cacheProvider || new RedisCacheProvider();
        this.prisma = prisma || new PrismaClient();
        this.reindexQueue =
            reindexQueue || new ReindexQueue(process.env.REDIS_URL, this.prisma, this.embeddingsService);
    }
    /**
     * Performs active health pings to Pinecone vector store, Ollama LLM, and PostgreSQL database.
     */
    async getSystemStatus() {
        const [databaseHealthy, ollamaHealthy, pineconeHealthy, pendingJobsCount] = await Promise.all([
            this.checkDatabaseHealth(),
            this.checkOllamaHealth(),
            this.checkPineconeHealth(),
            this.getPendingJobsCount(),
        ]);
        return {
            pineconeHealthy,
            ollamaHealthy,
            databaseHealthy,
            pendingJobsCount,
        };
    }
    /**
     * Triggers embedding re-indexing background job via BullMQ queue worker.
     */
    async triggerReindex(dto) {
        console.log(`[AdminService] Enqueuing reindex job: forceAll=${dto.forceAll}, batchSize=${dto.batchSize}`);
        return this.reindexQueue.addReindexJob({
            forceAll: dto.forceAll ?? false,
            batchSize: dto.batchSize ?? 50,
        });
    }
    /**
     * Flushes Redis database cache and in-memory fallback caches.
     */
    async clearCache() {
        console.log('[AdminService] Executing full Redis/in-memory cache flush...');
        await this.cacheProvider.flush();
        return true;
    }
    async checkDatabaseHealth() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch {
            return false;
        }
    }
    async checkOllamaHealth() {
        const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        try {
            const res = await fetch(`${ollamaUrl}/api/tags`, {
                signal: AbortSignal.timeout(2000),
            });
            if (res.ok)
                return true;
        }
        catch {
            // Fallback: ping LLM provider
        }
        try {
            await this.llmProvider.generateCompletion('ping', { maxTokens: 1 });
            return true;
        }
        catch {
            return false;
        }
    }
    async checkPineconeHealth() {
        try {
            const dummyVector = new Array(768).fill(0.01);
            await this.vectorStoreProvider.querySimilarity(dummyVector, 1);
            return true;
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('Pinecone client not initialized') ||
                msg.includes('401') ||
                msg.includes('Unauthorized') ||
                msg.includes('ENOTFOUND')) {
                return false;
            }
            return !!process.env.PINECONE_API_KEY;
        }
    }
    async getPendingJobsCount() {
        try {
            const queueCount = await this.reindexQueue.getPendingJobsCount();
            const docsProcessing = await this.prisma.uploadedDocument.count({
                where: { status: 'Processing' },
            });
            return queueCount + docsProcessing;
        }
        catch {
            return 0;
        }
    }
}
//# sourceMappingURL=admin.service.js.map