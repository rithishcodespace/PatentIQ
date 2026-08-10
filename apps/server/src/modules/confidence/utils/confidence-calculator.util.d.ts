import type { ConfidenceLevel } from '../interfaces/confidence.interface.js';
import type { SearchResult } from '../../search/interfaces/search.interface.js';
import type { NoveltyAnalysisResult } from '../../rag/interfaces/rag.interface.js';
export declare class ConfidenceCalculatorUtil {
    /**
     * Maps a numeric score (0–100) to a qualitative confidence level.
     * Thresholds:
     * 90-100: Very High
     * 75-89:  High
     * 60-74:  Medium
     * 40-59:  Low
     * 0-39:   Very Low
     */
    static mapScoreToLevel(score: number): ConfidenceLevel;
    /**
     * Clamps a value between 0 and 100 rounded to 1 decimal place.
     */
    static clampScore(score: number): number;
    /**
     * Calculates metadata completeness score (0–100) across retrieved patents.
     */
    static calculateMetadataCompleteness(patents: SearchResult[]): number;
    /**
     * Evaluates similarity score distribution consistency (0–100).
     * Rewards tight score clustering or clear top-tier separation over random scatter.
     */
    static calculateScoreDistribution(scores: number[]): number;
    /**
     * Evaluates section completeness (0–100) of AI-generated 7-section novelty analysis.
     */
    static calculateAnalysisCompleteness(novelty: NoveltyAnalysisResult): number;
}
//# sourceMappingURL=confidence-calculator.util.d.ts.map