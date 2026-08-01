import type {
  IConfidenceService,
  ConfidenceScoreItem,
  FullConfidenceResult,
  ConfidenceConfig,
  RetrievalConfidenceFactors,
  AnalysisConfidenceFactors,
} from '../interfaces/confidence.interface.js';
import type { SearchResult } from '../../search/interfaces/search.interface.js';
import type { NoveltyAnalysisResult } from '../../rag/interfaces/rag.interface.js';
import { ConfidenceCalculatorUtil } from '../utils/confidence-calculator.util.js';

export class ConfidenceService implements IConfidenceService {
  private readonly config: ConfidenceConfig;

  constructor(customConfig?: Partial<ConfidenceConfig>) {
    this.config = {
      topScoreWeight: parseFloat(process.env.CONFIDENCE_TOP_SCORE_WEIGHT || '0.40'),
      avgScoreWeight: parseFloat(process.env.CONFIDENCE_AVG_SCORE_WEIGHT || '0.30'),
      distributionWeight: parseFloat(
        process.env.CONFIDENCE_DISTRIBUTION_WEIGHT || process.env.CONFIDENCE_OVERLAP_WEIGHT || '0.15'
      ),
      metadataWeight: parseFloat(process.env.CONFIDENCE_METADATA_WEIGHT || '0.15'),
      retrievalWeight: parseFloat(process.env.CONFIDENCE_RETRIEVAL_WEIGHT || '0.50'),
      completenessWeight: parseFloat(process.env.CONFIDENCE_ANALYSIS_COMPLETENESS_WEIGHT || '0.30'),
      claimOverlapWeight: parseFloat(process.env.CONFIDENCE_CLAIMS_OVERLAP_WEIGHT || '0.20'),
      overallRetrievalWeight: parseFloat(process.env.CONFIDENCE_OVERALL_RETRIEVAL_WEIGHT || '0.40'),
      overallAnalysisWeight: parseFloat(process.env.CONFIDENCE_OVERALL_ANALYSIS_WEIGHT || '0.60'),
      ...customConfig,
    };
  }

  /**
   * Calculates Retrieval Confidence Score (0–100) and Level based on search matches.
   */
  public calculateRetrievalConfidence(
    results: SearchResult[],
    requestedTopK: number = 10
  ): ConfidenceScoreItem {
    try {
      if (!results || results.length === 0) {
        return { score: 0.0, level: 'Very Low' };
      }

      const scores = results.map((r) => r.score || 0);
      const topScore = scores[0] || 0;
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

      // Convert similarity scores (0-1) to percentage scale (0-100)
      const topScoreScaled = topScore * 100;
      const avgScoreScaled = avgScore * 100;

      const distributionScore = ConfidenceCalculatorUtil.calculateScoreDistribution(scores);
      const countRatioScore = Math.min(100, (results.length / Math.max(1, requestedTopK)) * 100);
      const metadataScore = ConfidenceCalculatorUtil.calculateMetadataCompleteness(results);

      // Weighted sum calculation
      const rawScore =
        topScoreScaled * this.config.topScoreWeight +
        avgScoreScaled * this.config.avgScoreWeight +
        distributionScore * this.config.distributionWeight +
        metadataScore * this.config.metadataWeight;

      // Adjust for partial candidate retrieval if fewer patents than requested were returned
      const countMultiplier = 0.85 + (countRatioScore / 100) * 0.15;
      const finalScore = ConfidenceCalculatorUtil.clampScore(rawScore * countMultiplier);

      const factors: RetrievalConfidenceFactors = {
        topScore: ConfidenceCalculatorUtil.clampScore(topScoreScaled),
        avgScore: ConfidenceCalculatorUtil.clampScore(avgScoreScaled),
        distributionScore: ConfidenceCalculatorUtil.clampScore(distributionScore),
        countScore: ConfidenceCalculatorUtil.clampScore(countRatioScore),
        metadataScore: ConfidenceCalculatorUtil.clampScore(metadataScore),
      };

      console.log(
        `[ConfidenceService] Retrieval Confidence Calculated | score=${finalScore} | level=${ConfidenceCalculatorUtil.mapScoreToLevel(finalScore)} | factors=${JSON.stringify(factors)}`
      );

      return {
        score: finalScore,
        level: ConfidenceCalculatorUtil.mapScoreToLevel(finalScore),
      };
    } catch (err) {
      console.error('[ConfidenceService] Error calculating retrieval confidence fallback used:', err);
      return { score: 20.0, level: 'Very Low' };
    }
  }

  /**
   * Calculates Novelty Analysis Confidence Score (0–100) and Level.
   */
  public calculateAnalysisConfidence(params: {
    retrievalConfidence: number;
    retrievedPatents: SearchResult[];
    noveltyAnalysis: NoveltyAnalysisResult;
    overlappingClaimsCount?: number | undefined;
  }): ConfidenceScoreItem {
    try {
      const { retrievalConfidence, retrievedPatents, noveltyAnalysis, overlappingClaimsCount } = params;

      if (!retrievedPatents || retrievedPatents.length === 0 || !noveltyAnalysis) {
        return { score: 10.0, level: 'Very Low' };
      }

      const completenessScore = ConfidenceCalculatorUtil.calculateAnalysisCompleteness(noveltyAnalysis);
      const metadataQualityScore = ConfidenceCalculatorUtil.calculateMetadataCompleteness(retrievedPatents);

      // Claim overlap ratio score based on retrieved claims or identified overlaps
      const totalOverlaps =
        overlappingClaimsCount !== undefined
          ? overlappingClaimsCount
          : (noveltyAnalysis.overlappingClaims || []).length;
      const claimOverlapScore = Math.min(100, Math.max(30, totalOverlaps * 25));

      const rawScore =
        retrievalConfidence * this.config.retrievalWeight +
        completenessScore * this.config.completenessWeight +
        claimOverlapScore * this.config.claimOverlapWeight;

      const finalScore = ConfidenceCalculatorUtil.clampScore(rawScore);

      const factors: AnalysisConfidenceFactors = {
        retrievalScore: retrievalConfidence,
        completenessScore: ConfidenceCalculatorUtil.clampScore(completenessScore),
        claimOverlapScore: ConfidenceCalculatorUtil.clampScore(claimOverlapScore),
        metadataQualityScore: ConfidenceCalculatorUtil.clampScore(metadataQualityScore),
      };

      console.log(
        `[ConfidenceService] Analysis Confidence Calculated | score=${finalScore} | level=${ConfidenceCalculatorUtil.mapScoreToLevel(finalScore)} | factors=${JSON.stringify(factors)}`
      );

      return {
        score: finalScore,
        level: ConfidenceCalculatorUtil.mapScoreToLevel(finalScore),
      };
    } catch (err) {
      console.error('[ConfidenceService] Error calculating analysis confidence fallback used:', err);
      return { score: 20.0, level: 'Very Low' };
    }
  }

  /**
   * Combines Retrieval Confidence and Analysis Confidence into Overall Confidence.
   */
  public calculateOverallConfidence(retrievalScore: number, analysisScore: number): ConfidenceScoreItem {
    try {
      const rawScore =
        retrievalScore * this.config.overallRetrievalWeight +
        analysisScore * this.config.overallAnalysisWeight;

      const finalScore = ConfidenceCalculatorUtil.clampScore(rawScore);

      console.log(
        `[ConfidenceService] Overall Confidence Calculated | score=${finalScore} | level=${ConfidenceCalculatorUtil.mapScoreToLevel(finalScore)} | retrievalScore=${retrievalScore} | analysisScore=${analysisScore}`
      );

      return {
        score: finalScore,
        level: ConfidenceCalculatorUtil.mapScoreToLevel(finalScore),
      };
    } catch (err) {
      console.error('[ConfidenceService] Error calculating overall confidence fallback used:', err);
      return { score: 20.0, level: 'Very Low' };
    }
  }

  /**
   * Computes full confidence breakdown object containing retrieval, analysis, and overall scores.
   */
  public computeFullConfidence(
    results: SearchResult[],
    noveltyAnalysis?: NoveltyAnalysisResult,
    requestedTopK: number = 10,
    overlappingClaimsCount?: number
  ): FullConfidenceResult {
    const retrieval = this.calculateRetrievalConfidence(results, requestedTopK);

    let analysis: ConfidenceScoreItem;
    if (noveltyAnalysis) {
      analysis = this.calculateAnalysisConfidence({
        retrievalConfidence: retrieval.score,
        retrievedPatents: results,
        noveltyAnalysis,
        overlappingClaimsCount,
      });
    } else {
      // Fallback for search-only queries
      analysis = {
        score: retrieval.score,
        level: retrieval.level,
      };
    }

    const overall = this.calculateOverallConfidence(retrieval.score, analysis.score);

    return {
      retrieval,
      analysis,
      overall,
    };
  }
}
