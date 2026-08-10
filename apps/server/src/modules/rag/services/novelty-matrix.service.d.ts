import type { ISearchService } from '../../search/interfaces/search.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
import type { IFeatureDeconstructionService } from '../interfaces/rag.interface.js';
import type { NoveltyMatrixRequestInput, NoveltyMatrixResult } from '../interfaces/novelty-matrix.interface.js';
export declare class NoveltyMatrixService {
    private readonly searchService;
    private readonly llmProvider;
    private readonly featureDeconstructionService?;
    constructor(searchService: ISearchService, llmProvider: ILLMProvider, featureDeconstructionService?: IFeatureDeconstructionService | undefined);
    /**
     * Generates Element-Level Novelty Overlap Matrix comparing features against prior-art patents.
     */
    generateNoveltyMatrix(input: NoveltyMatrixRequestInput): Promise<NoveltyMatrixResult>;
}
//# sourceMappingURL=novelty-matrix.service.d.ts.map