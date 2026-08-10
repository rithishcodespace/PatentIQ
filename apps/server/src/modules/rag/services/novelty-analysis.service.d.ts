import type { INoveltyAnalysisService } from '../interfaces/rag.interface.js';
import type { RagAnalysisRequest, RagAnalysisResponse } from '../interfaces/rag.interface.js';
import type { ISearchService } from '../../search/interfaces/search.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
import type { IHistoryService } from '../../history/interfaces/history.interface.js';
export declare class NoveltyAnalysisService implements INoveltyAnalysisService {
    private readonly searchService;
    private readonly llmProvider;
    private readonly historyService?;
    constructor(searchService: ISearchService, llmProvider: ILLMProvider, historyService?: IHistoryService | undefined);
    /**
     * Performs grounded 7-section AI novelty analysis using Qwen (Ollama)
     * on Top-K prior-art patents retrieved from SearchService.
     */
    analyzeNovelty(request: RagAnalysisRequest): Promise<RagAnalysisResponse>;
}
//# sourceMappingURL=novelty-analysis.service.d.ts.map