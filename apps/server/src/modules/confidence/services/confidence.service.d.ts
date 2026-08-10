import type { IConfidenceService, ConfidenceScoreItem, FullConfidenceResult, ConfidenceConfig } from '../interfaces/confidence.interface.js';
import type { SearchResult } from '../../search/interfaces/search.interface.js';
import type { NoveltyAnalysisResult } from '../../rag/interfaces/rag.interface.js';
export declare class ConfidenceService implements IConfidenceService {
    private readonly config;
    constructor(customConfig?: Partial<ConfidenceConfig>);
    /**
     * Calculates Retrieval Confidence Score (0–100) and Level based on search matches.
     */
    calculateRetrievalConfidence(results: SearchResult[], requestedTopK?: number): ConfidenceScoreItem;
    /**
     * Calculates Novelty Analysis Confidence Score (0–100) and Level.
     */
    calculateAnalysisConfidence(params: {
        retrievalConfidence: number;
        retrievedPatents: SearchResult[];
        noveltyAnalysis: NoveltyAnalysisResult;
        overlappingClaimsCount?: number | undefined;
    }): ConfidenceScoreItem;
    /**
     * Combines Retrieval Confidence and Analysis Confidence into Overall Confidence.
     */
    calculateOverallConfidence(retrievalScore: number, analysisScore: number): ConfidenceScoreItem;
    /**
     * Computes full confidence breakdown object containing retrieval, analysis, and overall scores.
     */
    computeFullConfidence(results: SearchResult[], noveltyAnalysis?: NoveltyAnalysisResult, requestedTopK?: number, overlappingClaimsCount?: number): FullConfidenceResult;
}
//# sourceMappingURL=confidence.service.d.ts.map