import type { IAdminService } from '../interfaces/admin-service.interface.js';
import type { ReindexEmbeddingsDto, SystemStatusDto } from '../dto/admin.dto.js';
import type { IVectorStoreProvider } from '../../../providers/vectorstore/vectorstore-provider.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';

export class AdminService implements IAdminService {
  constructor(
    private readonly _vectorStoreProvider: IVectorStoreProvider,
    private readonly _llmProvider: ILLMProvider
  ) {}

  async getSystemStatus(): Promise<SystemStatusDto> {
    // TODO: Perform ping healthchecks on Pinecone, Ollama, and Database
    return {
      pineconeHealthy: true,
      ollamaHealthy: true,
      databaseHealthy: true,
      pendingJobsCount: 0,
    };
  }

  async triggerReindex(dto: ReindexEmbeddingsDto): Promise<{ jobId: string; queuedAt: Date }> {
    // TODO: Enqueue background job to reindex dataset embeddings
    console.log(`[AdminService] TODO: Trigger reindex with forceAll=${dto.forceAll}`);
    return {
      jobId: `reindex-job-${Date.now()}`,
      queuedAt: new Date(),
    };
  }

  async clearCache(): Promise<boolean> {
    // TODO: Flush Redis/In-memory cache
    return true;
  }
}
