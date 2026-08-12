import { z } from 'zod';

export const EvidenceAnalysisRequestSchema = z.object({
  query: z
    .string({ message: 'query or text is required' })
    .trim()
    .min(1, 'query cannot be empty'),
  selectedPatentIds: z
    .array(z.string().min(1))
    .min(1, 'At least one selectedPatentId is required')
    .optional(),
  strictMode: z.boolean().optional().default(true),
});

export type EvidenceAnalysisRequestDto = z.infer<typeof EvidenceAnalysisRequestSchema>;

export interface VerbatimCitedPatent {
  patentId: string;
  claimNumber: string;
  verbatimSnippet: string;
  section: 'claims' | 'abstract' | 'title' | string;
  sourceUrl?: string;
}

export interface FeatureEvidenceItem {
  featureId: string;
  featureName: string;
  description?: string;
  status: 'DIRECT_OVERLAP' | 'PARTIAL_OVERLAP' | 'NO_OVERLAP';
  confidence: number;
  citedPatents: VerbatimCitedPatent[];
}

export interface StatutoryAnalysis {
  sec102Anticipation: boolean;
  sec103Obviousness: boolean;
  statutoryBasis: string;
  combiningRationale: string;
  recommendations: string[];
}

export interface EvidenceSummary {
  overallStatutoryRisk: 'HIGH_ANTICIPATION_RISK' | 'HIGH_OBVIOUSNESS_RISK' | 'MODERATE_RISK' | 'LOW_RISK';
  statutoryBasis: string;
  confidenceScore: number;
  totalFeaturesAnalyzed: number;
  directOverlapCount: number;
  partialOverlapCount: number;
}

export interface EvidenceAnalysisResponseDto {
  success: boolean;
  query: string;
  evidenceSummary: EvidenceSummary;
  featureEvidenceMatrix: FeatureEvidenceItem[];
  statutoryAnalysis: StatutoryAnalysis;
}
