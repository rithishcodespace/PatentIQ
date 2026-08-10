import type { IUploadComparisonService } from '../interfaces/upload-comparison.interface.js';
import type { CompareDocumentRequestDto, CompareDocumentResponseDto } from '../dto/upload.dto.js';
import type { IDocumentProcessorService } from '../interfaces/upload-processor.interface.js';
import type { IUploadService } from '../interfaces/upload.interface.js';
import type { IEmbeddingsService } from '../../embeddings/interfaces/embeddings-service.interface.js';
import type { ISearchService } from '../../search/interfaces/search.interface.js';
import type { IRagService } from '../../rag/interfaces/rag.interface.js';
import type { IHistoryService } from '../../history/interfaces/history.interface.js';
export declare class UploadComparisonService implements IUploadComparisonService {
    private readonly uploadService;
    private readonly documentProcessorService;
    private readonly embeddingsService;
    private readonly searchService;
    private readonly ragService;
    private readonly historyService?;
    constructor(uploadService: IUploadService, documentProcessorService: IDocumentProcessorService, embeddingsService: IEmbeddingsService, searchService: ISearchService, ragService: IRagService, historyService?: IHistoryService | undefined);
    compareDocument(dto: CompareDocumentRequestDto): Promise<CompareDocumentResponseDto>;
}
//# sourceMappingURL=upload-comparison.service.d.ts.map