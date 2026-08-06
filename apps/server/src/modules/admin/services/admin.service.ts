import { PrismaClient } from '@prisma/client';
import type { IAdminService } from '../interfaces/admin-service.interface.js';
import type { ReindexEmbeddingsDto, SystemStatusDto } from '../dto/admin.dto.js';
import type { IVectorStoreProvider } from '../../../providers/vectorstore/vectorstore-provider.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
import type { ICacheProvider } from '../../../providers/cache/cache-provider.interface.js';
import { RedisCacheProvider } from '../../../providers/cache/redis-cache.provider.js';
import type { EmbeddingsService } from '../../embeddings/services/embeddings.service.js';
import { ReindexQueue } from '../../../jobs/reindex.queue.js';

export class AdminService implements IAdminService {
  private readonly cacheProvider: ICacheProvider;
  private readonly prisma: PrismaClient;
  private readonly reindexQueue: ReindexQueue;

  constructor(
    private readonly vectorStoreProvider: IVectorStoreProvider,
    private readonly llmProvider: ILLMProvider,
    cacheProvider?: ICacheProvider,
    prisma?: PrismaClient,
    private readonly embeddingsService?: EmbeddingsService,
    reindexQueue?: ReindexQueue
  ) {
    this.cacheProvider = cacheProvider || new RedisCacheProvider();
    this.prisma = prisma || new PrismaClient();
    this.reindexQueue =
      reindexQueue || new ReindexQueue(process.env.REDIS_URL, this.prisma, this.embeddingsService);
  }

  /**
   * Performs active health pings to Pinecone vector store, Ollama LLM, and PostgreSQL database.
   */
  async getSystemStatus(): Promise<SystemStatusDto> {
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
  async triggerReindex(dto: ReindexEmbeddingsDto): Promise<{ jobId: string; queuedAt: Date }> {
    console.log(`[AdminService] Enqueuing reindex job: forceAll=${dto.forceAll}, batchSize=${dto.batchSize}`);
    return this.reindexQueue.addReindexJob({
      forceAll: dto.forceAll ?? false,
      batchSize: dto.batchSize ?? 50,
    });
  }

  /**
   * Flushes Redis database cache and in-memory fallback caches.
   */
  async clearCache(): Promise<boolean> {
    console.log('[AdminService] Executing full Redis/in-memory cache flush...');
    await this.cacheProvider.flush();
    return true;
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async checkOllamaHealth(): Promise<boolean> {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    try {
      const res = await fetch(`${ollamaUrl}/api/tags`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return true;
    } catch {
      // Fallback: ping LLM provider
    }

    try {
      await this.llmProvider.generateCompletion('ping', { maxTokens: 1 });
      return true;
    } catch {
      return false;
    }
  }

  private async checkPineconeHealth(): Promise<boolean> {
    try {
      const dummyVector = new Array(768).fill(0.01);
      await this.vectorStoreProvider.querySimilarity(dummyVector, 1);
      return true;
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('Pinecone client not initialized') ||
        msg.includes('401') ||
        msg.includes('Unauthorized') ||
        msg.includes('ENOTFOUND')
      ) {
        return false;
      }
      return !!process.env.PINECONE_API_KEY;
    }
  }

  private async getPendingJobsCount(): Promise<number> {
    try {
      const queueCount = await this.reindexQueue.getPendingJobsCount();
      const docsProcessing = await this.prisma.uploadedDocument.count({
        where: { status: 'Processing' },
      });
      return queueCount + docsProcessing;
    } catch {
      return 0;
    }
  }
}
