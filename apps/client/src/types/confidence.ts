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

export interface FullConfidenceBlock {
  retrieval: ConfidenceScoreItem & { factors?: RetrievalConfidenceFactors };
  analysis: ConfidenceScoreItem & { factors?: AnalysisConfidenceFactors };
  overall: ConfidenceScoreItem;
}
