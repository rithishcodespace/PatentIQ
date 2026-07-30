import type { GenerateEmbeddingDto, BatchGenerateEmbeddingDto } from '../dto/embeddings.dto.js';

export interface IEmbeddingsService {
  generateAndStoreEmbedding(dto: GenerateEmbeddingDto): Promise<{ vectorId: string; dimension: number }>;
  generateBatchAndStoreEmbeddings(dto: BatchGenerateEmbeddingDto): Promise<{ count: number }>;
}
