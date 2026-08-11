import type { ISearchService } from '../../search/interfaces/search.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
import { FeatureExtractorService, type InventionFeature } from './feature-extractor.service.js';
import { FeatureAlignmentService, type PatentFeatureAlignment } from './feature-alignment.service.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';

export interface ScoreBreakdown {
  directOverlapScore: number;
  partialOverlapScore: number;
  singleReferenceContribution: number;
  distributedOverlapContribution: number;
}

export interface NoveltyAssessmentMetrics {
  executionTimeMs: number;
  evaluatedFeaturesCount: number;
  evaluatedPatentsCount: number;
  singleReferenceCoverageLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  singleReferenceCoverageScore: number;
  distributedOverlapLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  distributedOverlapScore: number;
  distinctFeatures: string[];
  evidenceConfidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  scoreBreakdown: ScoreBreakdown;
}

export interface FeatureSummary {
  total: number;
  directOverlap: number;
  partialOverlap: number;
  novel: number;
  unknown: number;
}

export interface StructuredNoveltyResult {
  overallRiskLevel: 'HIGH_RISK' | 'MODERATE_RISK' | 'LOW_RISK';
  noveltyRiskScore: number;
  executiveRationale: string;
  matrix: PatentFeatureAlignment[];
  metrics: NoveltyAssessmentMetrics;
  extractedFeatures: InventionFeature[];
  featureSummary: FeatureSummary;
}

export interface NoveltyMatrixRequestInput {
  query?: string | undefined;
  text?: string | undefined;
  topK?: number | undefined;
  features?: any[] | undefined;
}

export class NoveltyMatrixService {
  private readonly featureExtractor: FeatureExtractorService;
  private readonly featureAligner: FeatureAlignmentService;

  constructor(
    private readonly searchService: ISearchService,
    private readonly llmProvider?: ILLMProvider | undefined
  ) {
    this.featureExtractor = new FeatureExtractorService(llmProvider);
    this.featureAligner = new FeatureAlignmentService(llmProvider);
  }

  /**
   * Generates Element-Level Novelty Overlap Matrix and AI Prior-Art Risk Assessment.
   */
  async generateNoveltyMatrix(input: NoveltyMatrixRequestInput): Promise<StructuredNoveltyResult> {
    const startTime = Date.now();
    const query = (input.query || input.text || '').trim();

    if (!query) {
      throw new BadRequestError('Either query or text is required for novelty matrix assessment.');
    }

    // 1. Extract Atomic Technical Features (F1...Fn)
    const features: InventionFeature[] = await this.featureExtractor.extractFeatures(query);
    const totalFeaturesCount = Math.max(1, features.length);

    // 2. Retrieve Top-K Prior-Art Patents via Hybrid Retrieval Pipeline
    const topK = input.topK ?? 10;
    const searchResponse = await this.searchService.search({ query, topK });
    const rawPatents = searchResponse.results || [];

    const candidatePatents = rawPatents.map((p) => ({
      patentId: p.patentId,
      title: p.title || `Patent ${p.patentId}`,
      abstract: p.abstract || '',
      claims: p.claims || '',
      ipc: p.ipc || 'G06F',
      score: p.score,
    }));

    if (candidatePatents.length === 0) {
      return {
        overallRiskLevel: 'LOW_RISK',
        noveltyRiskScore: 5,
        executiveRationale: 'No prior-art patents were retrieved matching the submitted invention query. High individual feature novelty indicated.',
        matrix: [],
        extractedFeatures: features,
        featureSummary: {
          total: features.length,
          directOverlap: 0,
          partialOverlap: 0,
          novel: features.length,
          unknown: 0,
        },
        metrics: {
          executionTimeMs: Date.now() - startTime,
          evaluatedFeaturesCount: features.length,
          evaluatedPatentsCount: 0,
          singleReferenceCoverageLevel: 'LOW',
          singleReferenceCoverageScore: 0,
          distributedOverlapLevel: 'LOW',
          distributedOverlapScore: 0,
          distinctFeatures: features.map((f) => f.id),
          evidenceConfidenceLevel: 'HIGH',
          scoreBreakdown: {
            directOverlapScore: 0,
            partialOverlapScore: 0,
            singleReferenceContribution: 0,
            distributedOverlapContribution: 0,
          },
        },
      };
    }

    // 3. Feature-Level Alignment against Candidate Patents via LLM & Real Text Evidence
    const matrix: PatentFeatureAlignment[] = await this.featureAligner.alignFeaturesWithPatents(features, candidatePatents);

    // 4. Per-Feature Summary & Single-Reference Coverage vs Distributed Overlap Analysis
    let maxSinglePatentOverlapPct = 0;
    const coveredFeatureIds = new Set<string>();

    matrix.forEach((patent) => {
      const coverageScore = patent.weightedCoverage ?? patent.overallPatentOverlapScore ?? 0;
      if (coverageScore > maxSinglePatentOverlapPct) {
        maxSinglePatentOverlapPct = coverageScore;
      }
      patent.featureOverlaps.forEach((overlap) => {
        if (overlap.status === 'DIRECT_OVERLAP' || overlap.status === 'PARTIAL_OVERLAP') {
          coveredFeatureIds.add(overlap.featureId);
        }
      });
    });

    const directFeaturesCount = features.filter((f) => {
      return matrix.some((p) => p.featureOverlaps.some((fo) => fo.featureId === f.id && fo.status === 'DIRECT_OVERLAP'));
    }).length;

    const partialFeaturesCount = features.filter((f) => {
      const hasDirect = matrix.some((p) => p.featureOverlaps.some((fo) => fo.featureId === f.id && fo.status === 'DIRECT_OVERLAP'));
      if (hasDirect) return false;
      return matrix.some((p) => p.featureOverlaps.some((fo) => fo.featureId === f.id && fo.status === 'PARTIAL_OVERLAP'));
    }).length;

    const unknownFeaturesCount = features.filter((f) => {
      if (coveredFeatureIds.has(f.id)) return false;
      return matrix.some((p) => p.featureOverlaps.some((fo) => fo.featureId === f.id && fo.status === 'UNKNOWN'));
    }).length;

    const novelFeaturesCount = Math.max(0, features.length - (directFeaturesCount + partialFeaturesCount + unknownFeaturesCount));

    const featureSummary: FeatureSummary = {
      total: features.length,
      directOverlap: directFeaturesCount,
      partialOverlap: partialFeaturesCount,
      novel: novelFeaturesCount,
      unknown: unknownFeaturesCount,
    };

    const singleReferenceCoverageScore = maxSinglePatentOverlapPct;
    let distributedOverlapScore = Math.round((coveredFeatureIds.size / totalFeaturesCount) * 100);

    const directOverlapScore = Math.min(100, Math.round((directFeaturesCount / totalFeaturesCount) * 100));
    const partialOverlapScore = Math.min(100, Math.round((partialFeaturesCount / totalFeaturesCount) * 100));

    const singleReferenceCoverageLevel = singleReferenceCoverageScore >= 60 ? 'HIGH' : singleReferenceCoverageScore >= 35 ? 'MEDIUM' : 'LOW';
    const distributedOverlapLevel = distributedOverlapScore >= 70 ? 'HIGH' : distributedOverlapScore >= 40 ? 'MEDIUM' : 'LOW';

    // 5. Evidence Confidence Analysis
    let totalMatchConf = 0;
    let validEvidenceCount = 0;
    let totalMatchesCount = 0;
    let novelMatchesCount = 0;
    let unknownMatchesCount = 0;

    matrix.forEach((patent) => {
      patent.featureOverlaps.forEach((overlap) => {
        totalMatchesCount++;
        totalMatchConf += overlap.matchConfidence || 0.5;
        if (overlap.status === 'NOVEL') {
          novelMatchesCount++;
        } else if (overlap.status === 'UNKNOWN') {
          unknownMatchesCount++;
        }
        if (
          overlap.status !== 'NOVEL' &&
          overlap.status !== 'UNKNOWN' &&
          overlap.citationEvidence &&
          !overlap.citationEvidence.includes('No equivalent feature')
        ) {
          validEvidenceCount++;
        }
      });
    });

    const avgMatchConf = totalMatchesCount > 0 ? totalMatchConf / totalMatchesCount : 0;
    let evidenceConfidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';

    if (avgMatchConf >= 0.75 && (validEvidenceCount >= 2 || candidatePatents.length >= 5)) {
      evidenceConfidenceLevel = 'HIGH';
    } else if (avgMatchConf >= 0.45 || validEvidenceCount >= 1) {
      evidenceConfidenceLevel = 'MEDIUM';
    } else {
      evidenceConfidenceLevel = 'LOW';
    }

    // 6. Distinct Features Identification (Features lacking prior-art evidence across ALL candidates)
    const distinctFeatures = features
      .filter((f) => !coveredFeatureIds.has(f.id))
      .map((f) => f.id);

    // 7. Transparent Deterministic Risk Calculation Engine
    // Weights: 60% Single-Reference Coverage + 40% Distributed Feature Overlap
    const singleReferenceContribution = Math.round(singleReferenceCoverageScore * 0.60);
    const distributedOverlapContribution = Math.round(distributedOverlapScore * 0.40);
    
    let noveltyRiskScore = Math.min(98, Math.max(5, singleReferenceContribution + distributedOverlapContribution));

    // INVARIANT 1: Zero overlap MUST yield LOW risk score (<= 10%), never 25%!
    if (coveredFeatureIds.size === 0) {
      noveltyRiskScore = 5;
    }

    // INVARIANT 2: If directOverlap > 0, distributedOverlap cannot be 0
    if (directFeaturesCount > 0 && distributedOverlapScore === 0) {
      distributedOverlapScore = Math.round((directFeaturesCount / totalFeaturesCount) * 100);
    }

    // INVARIANT 3: Novel features must match distinctFeatures count when no overlap exists
    if (novelFeaturesCount > 0 && distinctFeatures.length === 0) {
      throw new Error(`[RAG Invariant Violation] ${novelFeaturesCount} features classified as NOVEL but distinctFeatures is empty.`);
    }

    let overallRiskLevel: 'HIGH_RISK' | 'MODERATE_RISK' | 'LOW_RISK' =
      noveltyRiskScore >= 65 ? 'HIGH_RISK' : noveltyRiskScore >= 35 ? 'MODERATE_RISK' : 'LOW_RISK';

    const rationaleDetail = coveredFeatureIds.size === 0
      ? `Evaluation of ${totalFeaturesCount} extracted claim limitations against ${candidatePatents.length} retrieved prior-art documents found no direct or partial feature disclosures. All ${distinctFeatures.length} features remain distinct, resulting in low prior-art risk (${noveltyRiskScore}%).`
      : distributedOverlapLevel === 'HIGH' && singleReferenceCoverageLevel !== 'HIGH'
      ? `High distributed prior-art overlap (${distributedOverlapScore}%) was detected across ${totalFeaturesCount} analyzed technical features. However, no single prior-art document covers all major features (Single-Reference Coverage: ${singleReferenceCoverageScore}%).`
      : `Evaluation of ${totalFeaturesCount} extracted technical claim limitations against ${candidatePatents.length} retrieved prior-art disclosures indicates ${overallRiskLevel === 'HIGH_RISK' ? 'significant' : overallRiskLevel === 'MODERATE_RISK' ? 'moderate' : 'low'} statutory overlap. Peak single-reference coverage is ${singleReferenceCoverageScore}%, with distributed overlap covering ${coveredFeatureIds.size} of ${totalFeaturesCount} features.`;

    console.log(`\n=================== [RAG ENGINE TRACE] ===================`);
    console.log(`EXTRACTED FEATURES → ${features.length} features [${features.map((f) => f.id).join(', ')}]`);
    console.log(`RETRIEVED PATENTS → ${candidatePatents.length} candidates [${candidatePatents.map((p) => p.patentId).join(', ')}]`);
    console.log(`FEATURE SUMMARY → Total: ${featureSummary.total} | Direct: ${featureSummary.directOverlap} | Partial: ${featureSummary.partialOverlap} | Novel: ${featureSummary.novel} | Unknown: ${featureSummary.unknown}`);
    console.log(`FEATURE MATCHES → ${totalMatchesCount} total comparisons`);
    console.log(`SINGLE REFERENCE → ${singleReferenceCoverageScore}% (${singleReferenceCoverageLevel})`);
    console.log(`DISTRIBUTED → ${distributedOverlapScore}% (${distributedOverlapLevel})`);
    console.log(`DISTINCT → ${distinctFeatures.length} [${distinctFeatures.join(', ')}]`);
    console.log(`EVIDENCE CONFIDENCE → ${evidenceConfidenceLevel}`);
    console.log(`RISK → ${noveltyRiskScore}% (${overallRiskLevel})`);
    console.log(`===========================================================\n`);

    return {
      overallRiskLevel,
      noveltyRiskScore,
      executiveRationale: rationaleDetail,
      matrix,
      extractedFeatures: features,
      featureSummary,
      metrics: {
        executionTimeMs: Date.now() - startTime,
        evaluatedFeaturesCount: features.length,
        evaluatedPatentsCount: candidatePatents.length,
        singleReferenceCoverageLevel,
        singleReferenceCoverageScore,
        distributedOverlapLevel,
        distributedOverlapScore,
        distinctFeatures,
        evidenceConfidenceLevel,
        scoreBreakdown: {
          directOverlapScore,
          partialOverlapScore,
          singleReferenceContribution,
          distributedOverlapContribution,
        },
      },
    };
  }
}
