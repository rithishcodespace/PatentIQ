import type { IAdminService } from '../interfaces/admin-service.interface.js';
import type { ReindexEmbeddingsDto, SystemStatusDto } from '../dto/admin.dto.js';
import type { IVectorStoreProvider } from '../../../providers/vectorstore/vectorstore-provider.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
import type { ICacheProvider } from '../../../providers/cache/cache-provider.interface.js';
import { RedisCacheProvider } from '../../../providers/cache/redis-cache.provider.js';

export class AdminService implements IAdminService {
  private readonly cacheProvider: ICacheProvider;

  constructor(
    private readonly _vectorStoreProvider: IVectorStoreProvider,
    private readonly _llmProvider: ILLMProvider,
    cacheProvider?: ICacheProvider
  ) {
    this.cacheProvider = cacheProvider || new RedisCacheProvider();
  }

  async getSystemStatus(): Promise<SystemStatusDto> {
    return {
      pineconeHealthy: true,
      ollamaHealthy: true,
      databaseHealthy: true,
      pendingJobsCount: 0,
    };
  }

  async triggerReindex(dto: ReindexEmbeddingsDto): Promise<{ jobId: string; queuedAt: Date }> {
    console.log(`[AdminService] Trigger reindex requested with forceAll=${dto.forceAll}`);
    return {
      jobId: `reindex-job-${Date.now()}`,
      queuedAt: new Date(),
    };
  }

  async clearCache(): Promise<boolean> {
    await this.cacheProvider.flush();
    return true;
  }
}
