import type { FullConfidenceBlock } from './confidence';

export interface SearchHistoryRecord {
  id: string;
  userId?: string;
  searchQuery: string;
  topK: number;
  appliedFilters?: {
    ipc?: string;
    country?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  totalResults: number;
  searchLatency: number;
  createdAt: string;
  confidence?: FullConfidenceBlock;
  retrievedPatents: Array<{
    patentId: string;
    title: string;
    similarityScore: number;
  }>;
  noveltyAnalysis?: {
    id: string;
    summary: string;
    overallScore: number;
    novelAspects: string[];
    overlappingClaims: string[];
    createdAt: string;
  };
}
