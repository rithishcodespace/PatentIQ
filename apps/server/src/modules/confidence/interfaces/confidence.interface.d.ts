import type { SearchResult } from '../../search/interfaces/search.interface.js';
import type { NoveltyAnalysisResult } from '../../rag/interfaces/rag.interface.js';
export type ConfidenceLevel = 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
export interface ConfidenceScoreItem {
    score: number;
    level: ConfidenceLevel;
}
export interface RetrievalConfidenceFactors {
    topScore: number;
    avgScore: number;
    distributionScore: number;
    countScore: number;
    metadataScore: number;
}
export interface AnalysisConfidenceFactors {
    retrievalScore: number;
    completenessScore: number;
    claimOverlapScore: number;
    metadataQualityScore: number;
}
export interface FullConfidenceResult {
    retrieval: ConfidenceScoreItem;
    analysis: ConfidenceScoreItem;
    overall: ConfidenceScoreItem;
    factors?: {
        retrievalFactors: RetrievalConfidenceFactors;
        analysisFactors: AnalysisConfidenceFactors;
    };
}
export interface ConfidenceConfig {
    topScoreWeight: number;
    avgScoreWeight: number;
    distributionWeight: number;
    metadataWeight: number;
    retrievalWeight: number;
    completenessWeight: number;
    claimOverlapWeight: number;
    overallRetrievalWeight: number;
    overallAnalysisWeight: number;
}
export interface IConfidenceService {
    /**
     * Calculates retrieval confidence score (0–100) and qualitative level based on similarity scores & metadata.
     */
    calculateRetrievalConfidence(results: SearchResult[], requestedTopK?: number): ConfidenceScoreItem;
    /**
     * Calculates novelty analysis confidence score (0–100) and qualitative level.
     */
    calculateAnalysisConfidence(params: {
        retrievalConfidence: number;
        retrievedPatents: SearchResult[];
        noveltyAnalysis: NoveltyAnalysisResult;
        overlappingClaimsCount?: number | undefined;
    }): ConfidenceScoreItem;
    /**
     * Combines retrieval and analysis confidence into an overall confidence score.
     */
    calculateOverallConfidence(retrievalScore: number, analysisScore: number): ConfidenceScoreItem;
    /**
     * Computes complete confidence breakdown object containing retrieval, analysis, and overall scores.
     */
    computeFullConfidence(results: SearchResult[], noveltyAnalysis?: NoveltyAnalysisResult, requestedTopK?: number, overlappingClaimsCount?: number): FullConfidenceResult;
}
//# sourceMappingURL=confidence.interface.d.ts.map