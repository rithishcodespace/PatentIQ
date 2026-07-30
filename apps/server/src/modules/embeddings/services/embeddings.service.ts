import type { IEmbeddingsService } from '../interfaces/embeddings-service.interface.js';
import type { GenerateEmbeddingDto, BatchGenerateEmbeddingDto } from '../dto/embeddings.dto.js';
import type { IEmbeddingProvider } from '../../../providers/embedding/embedding-provider.interface.js';
import type { IVectorStoreProvider } from '../../../providers/vectorstore/vectorstore-provider.interface.js';

export class EmbeddingsService implements IEmbeddingsService {
  constructor(
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly vectorStoreProvider: IVectorStoreProvider
  ) {}

  async generateAndStoreEmbedding(dto: GenerateEmbeddingDto): Promise<{ vectorId: string; dimension: number }> {
    const vector = await this.embeddingProvider.generateEmbedding(dto.text);
    const vectorId = dto.patentId ? `${dto.patentId}-${dto.section ?? 'full'}` : `vec-${Date.now()}`;
    await this.vectorStoreProvider.upsertVector(vectorId, vector, {
      patentId: dto.patentId,
      section: dto.section,
    });

    return { vectorId, dimension: vector.length };
  }

  async generateBatchAndStoreEmbeddings(dto: BatchGenerateEmbeddingDto): Promise<{ count: number }> {
    const vectors = await this.embeddingProvider.generateBatchEmbeddings(dto.texts);
    const items = vectors.map((v, idx) => ({
      id: `${dto.patentId ?? 'batch'}-${idx}`,
      vector: v,
    }));
    await this.vectorStoreProvider.upsertBatchVectors(items);
    return { count: items.length };
  }
}
