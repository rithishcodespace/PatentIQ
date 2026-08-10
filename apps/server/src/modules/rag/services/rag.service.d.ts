import type { IRagService, INoveltyAnalysisService, IOverlapAnalysisService, IFeatureDeconstructionService, InventionDeconstructionResult, RagAnalysisRequest, RagAnalysisResponse } from '../interfaces/rag.interface.js';
import type { HybridRankingDto, RankedPatentCandidate } from '../dto/rag.dto.js';
import type { ISearchService } from '../../search/interfaces/search.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
import type { IHistoryService } from '../../history/interfaces/history.interface.js';
import type { IConfidenceService } from '../../confidence/interfaces/confidence.interface.js';
import type { ICacheProvider } from '../../../providers/cache/cache-provider.interface.js';
export declare class RagService implements IRagService {
    private readonly searchService;
    private readonly llmProvider;
    private readonly noveltyAnalysisService;
    private readonly overlapAnalysisService;
    private readonly featureDeconstructionService;
    private readonly confidenceService;
    private readonly cacheProvider;
    constructor(searchService: ISearchService, llmProvider: ILLMProvider, noveltyAnalysisService?: INoveltyAnalysisService, overlapAnalysisService?: IOverlapAnalysisService, featureDeconstructionService?: IFeatureDeconstructionService, historyService?: IHistoryService, confidenceService?: IConfidenceService, cacheProvider?: ICacheProvider);
    /**
     * Primary RAG Pipeline:
     * 1. Retrieves Top-K prior-art patents using SearchService.
     * 2. Executes grounded 7-section novelty analysis via Qwen.
     * 3. Executes section-level and claim-level overlap analysis.
     * 4. Returns combined analysis and overlap payload with latency metrics.
     */
    analyze(request: RagAnalysisRequest): Promise<RagAnalysisResponse>;
    /**
     * Deconstructs plain text invention query into structured technical features.
     */
    deconstructInvention(input: string | {
        query?: string;
        text?: string;
    }): Promise<InventionDeconstructionResult>;
    /**
     * Backward-compatible hybrid ranking method.
     */
    hybridRank(dto: HybridRankingDto): Promise<RankedPatentCandidate[]>;
    /**
     * Backward-compatible cross encoder reranking method.
     */
    rerankCrossEncoder(candidates: RankedPatentCandidate[], topK?: number): Promise<RankedPatentCandidate[]>;
}
//# sourceMappingURL=rag.service.d.ts.map