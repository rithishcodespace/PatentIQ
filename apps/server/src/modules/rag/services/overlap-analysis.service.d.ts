import type { IOverlapAnalysisService } from '../interfaces/rag.interface.js';
import type { RagAnalysisRequest, OverlapAnalysisItem } from '../interfaces/rag.interface.js';
import type { ISearchService, SearchResult } from '../../search/interfaces/search.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
export declare class OverlapAnalysisService implements IOverlapAnalysisService {
    private readonly searchService;
    private readonly llmProvider;
    constructor(searchService: ISearchService, llmProvider: ILLMProvider);
    /**
     * Performs section-level and claim-level overlap analysis between user invention query
     * and Top-K retrieved prior-art patents using Qwen (Ollama).
     */
    analyzeOverlap(request: RagAnalysisRequest, searchResults?: SearchResult[]): Promise<OverlapAnalysisItem[]>;
}
//# sourceMappingURL=overlap-analysis.service.d.ts.map