import type { GenerateEmbeddingDto, BatchGenerateEmbeddingDto } from '../dto/embeddings.dto.js';
import type { StandardPatentDocument } from '../../upload/interfaces/upload-processor.interface.js';

export interface PatentSectionEmbeddingsResult {
  model: string;
  dimensions: number;
  sections: string[];
  generatedAt: string;
  vectors: {
    title?: number[];
    abstract?: number[];
    claims?: number[];
    fullText?: number[];
  };
}

export interface IEmbeddingsService {
  generateAndStoreEmbedding(dto: GenerateEmbeddingDto): Promise<{ vectorId: string; dimension: number }>;
  generateBatchAndStoreEmbeddings(dto: BatchGenerateEmbeddingDto): Promise<{ count: number }>;
  generatePatentDocumentEmbeddings(doc: StandardPatentDocument): Promise<PatentSectionEmbeddingsResult>;
}
