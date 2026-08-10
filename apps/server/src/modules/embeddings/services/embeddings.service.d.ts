import type { IEmbeddingsService, PatentSectionEmbeddingsResult } from '../interfaces/embeddings-service.interface.js';
import type { GenerateEmbeddingDto, BatchGenerateEmbeddingDto } from '../dto/embeddings.dto.js';
import type { IEmbeddingProvider } from '../../../providers/embedding/embedding-provider.interface.js';
import type { IVectorStoreProvider } from '../../../providers/vectorstore/vectorstore-provider.interface.js';
import type { StandardPatentDocument } from '../../upload/interfaces/upload-processor.interface.js';
export declare class EmbeddingsService implements IEmbeddingsService {
    private readonly embeddingProvider;
    private readonly vectorStoreProvider?;
    constructor(embeddingProvider: IEmbeddingProvider, vectorStoreProvider?: IVectorStoreProvider | undefined);
    generateAndStoreEmbedding(dto: GenerateEmbeddingDto): Promise<{
        vectorId: string;
        dimension: number;
    }>;
    generateBatchAndStoreEmbeddings(dto: BatchGenerateEmbeddingDto): Promise<{
        count: number;
    }>;
    /**
     * Generates section-wise embeddings for a StandardPatentDocument using the configured embedding provider.
     * Embeddings are held in memory for the request duration and returned as metadata.
     */
    generatePatentDocumentEmbeddings(doc: StandardPatentDocument): Promise<PatentSectionEmbeddingsResult>;
}
//# sourceMappingURL=embeddings.service.d.ts.map