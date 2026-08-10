import { PrismaClient } from '@prisma/client';
import type { IAdminService } from '../interfaces/admin-service.interface.js';
import type { ReindexEmbeddingsDto, SystemStatusDto } from '../dto/admin.dto.js';
import type { IVectorStoreProvider } from '../../../providers/vectorstore/vectorstore-provider.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
import type { ICacheProvider } from '../../../providers/cache/cache-provider.interface.js';
import type { EmbeddingsService } from '../../embeddings/services/embeddings.service.js';
import { ReindexQueue } from '../../../jobs/reindex.queue.js';
export declare class AdminService implements IAdminService {
    private readonly vectorStoreProvider;
    private readonly llmProvider;
    private readonly embeddingsService?;
    private readonly cacheProvider;
    private readonly prisma;
    private readonly reindexQueue;
    constructor(vectorStoreProvider: IVectorStoreProvider, llmProvider: ILLMProvider, cacheProvider?: ICacheProvider, prisma?: PrismaClient, embeddingsService?: EmbeddingsService | undefined, reindexQueue?: ReindexQueue);
    /**
     * Performs active health pings to Pinecone vector store, Ollama LLM, and PostgreSQL database.
     */
    getSystemStatus(): Promise<SystemStatusDto>;
    /**
     * Triggers embedding re-indexing background job via BullMQ queue worker.
     */
    triggerReindex(dto: ReindexEmbeddingsDto): Promise<{
        jobId: string;
        queuedAt: Date;
    }>;
    /**
     * Flushes Redis database cache and in-memory fallback caches.
     */
    clearCache(): Promise<boolean>;
    private checkDatabaseHealth;
    private checkOllamaHealth;
    private checkPineconeHealth;
    private getPendingJobsCount;
}
//# sourceMappingURL=admin.service.d.ts.map