import type { FullConfidenceBlock } from './confidence';

export interface CitedPatent {
  patentId: string;
  title: string;
  similarityScore: number;
  ipc: string;
  country: string;
  publicationDate: string;
  owner: string;
  abstract: string;
  claims: string;
}

export interface OverlappingClaimItem {
  claimNumber: number | string;
  summary: string;
  overlapStrength: 'High' | 'Medium' | 'Low';
  reason: string;
  citedPatentId: string;
}

export interface OverlapAnalysisPayload {
  patentId: string;
  title: string;
  similarityScore: number;
  relevantSections: Array<{
    section: string;
    reason: string;
  }>;
  overlappingClaims: OverlappingClaimItem[];
}

export interface NoveltyAnalysisData {
  summary: string;
  similarPatents: Array<{ patentId: string; reason: string }>;
  featureComparison: {
    commonFeatures: string[];
    uniqueFeatures: string[];
    partialOverlap: string[];
  };
  novelAspects: string[];
  overlappingClaims: string[];
  risks: string[];
  recommendations: string[];
}

export interface RagResponseData {
  success: boolean;
  query: string;
  confidence: FullConfidenceBlock;
  retrievedPatents: CitedPatent[];
  analysis: NoveltyAnalysisData;
  overlapAnalysis: OverlapAnalysisPayload[];
  metrics: {
    retrievalTimeMs: number;
    promptTimeMs: number;
    llmInferenceTimeMs: number;
    totalTimeMs: number;
    retrievedCount: number;
    overlappingClaimsCount: number;
  };
}
