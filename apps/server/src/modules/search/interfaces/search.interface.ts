import type { RecordMetadata } from '@pinecone-database/pinecone';
import type { SearchRequestDto, SearchResponseDto, SearchResultDto, PriorArtMatchResult } from '../dto/search.dto.js';

/**
 * Metadata stored inside Pinecone vector records.
 */
export type PineconeVectorMetadata = RecordMetadata & {
  patentId: string;
  publicationNumber?: string;
  sectionType?: 'title' | 'abstract' | 'claim' | 'claims' | 'description' | string;
  section?: 'title' | 'abstract' | 'claims' | 'description' | string;
  claimNumber?: number;
  chunkId?: string;
  title?: string;
  abstract?: string;
  claims?: string;
  description?: string;
  inventors?: string | string[];
  owner?: string;
  assignee?: string;
  applicants?: string | string[];
  publicationDate?: string;
  filingDate?: string;
  priorityDate?: string;
  ipc?: string;
  cpc?: string;
  country?: string;
  sourceUrl?: string;
};

/**
 * Metadata search filter criteria for Pinecone queries.
 */
export interface SearchFilter {
  ipc?: string | string[] | undefined;
  cpc?: string | string[] | undefined;
  country?: string | undefined;
  publicationDate?: string | undefined;
  publicationDateFrom?: string | undefined;
  publicationDateTo?: string | undefined;
  owner?: string | undefined;
  section?: 'title' | 'abstract' | 'claims' | 'description' | undefined;
}

/**
 * Raw match item returned from Pinecone query.
 */
export interface PineconeMatchResult {
  id: string;
  score: number;
  metadata?: PineconeVectorMetadata | undefined;
}

/**
 * Interface representing a BM25 sparse keyword match.
 */
export interface BM25MatchResult {
  id: string;
  patentId: string;
  publicationNumber?: string | undefined;
  title: string;
  abstract: string;
  claims?: string | undefined;
  description?: string | undefined;
  ipc: string;
  cpc?: string | undefined;
  inventors?: string | undefined;
  owner?: string | undefined;
  applicants?: string | undefined;
  publicationDate?: string | undefined;
  filingDate?: string | undefined;
  priorityDate?: string | undefined;
  sourceUrl?: string | undefined;
  rank?: number | undefined;
  bm25Score: number;
}

/**
 * Interface alias for Pinecone vector match.
 */
export type PineconeMatch = PineconeMatchResult;

/**
 * Interface representing a formatted patent search result.
 */
export interface SearchResult {
  rank: number;
  score: number;
  denseScore?: number | undefined;
  patentId: string;
  publicationNumber?: string | undefined;
  title: string;
  abstract: string;
  claims?: string | undefined;
  description?: string | undefined;
  ipc: string;
  cpc?: string | undefined;
  country?: string | undefined;
  owner?: string | undefined;
  applicants?: string | undefined;
  inventors?: string | undefined;
  publicationDate?: string | undefined;
  filingDate?: string | undefined;
  priorityDate?: string | undefined;
  section?: string | undefined;
  sectionType?: string | undefined;
  chunkId?: string | undefined;
  claimNumber?: number | undefined;
  sourceUrl?: string | undefined;
  rrfScore?: number | undefined;
  denseRank?: number | null | undefined;
  bm25Rank?: number | null | undefined;
  finalRank?: number | undefined;
  bm25Score?: number | undefined;
}

/**
 * Interface representing incoming search request.
 */
export interface SearchRequest {
  query: string;
  topK?: number | undefined;
  filters?: SearchFilter | undefined;
}

/**
 * Interface representing formatted search response.
 */
export interface SearchResponse {
  success: boolean;
  query: string;
  count: number;
  searchHistoryId?: string | undefined;
  filters?: SearchFilter | undefined;
  confidence?: {
    retrieval: { score: number; level: string };
    analysis?: { score: number; level: string };
    overall?: { score: number; level: string };
  } | undefined;
  results: SearchResult[];
  metrics?: SearchMetrics | undefined;
  provenance?: {
    dataSource: string;
    embeddingModel: string;
    isLiveVectorData: boolean;
    indexName: string;
  } | undefined;
}

/**
 * Execution metrics for search performance breakdown.
 */
export interface SearchMetrics {
  queryEmbeddingTimeMs: number;
  pineconeSearchTimeMs: number;
  bm25SearchTimeMs?: number | undefined;
  rrfRerankTimeMs?: number | undefined;
  totalExecutionTimeMs: number;
  totalResults: number;
}

/**
 * Reusable Patent Search Service Contract.
 */
export interface ISearchService {
  /**
   * Main search method handling request validation and execution.
   */
  search(input: string | SearchRequest, topK?: number, filters?: SearchFilter): Promise<SearchResponse>;

  /**
   * End-to-end execution returning detailed results and execution metrics.
   */
  executeSearch(
    query: string,
    topK?: number,
    filters?: SearchFilter
  ): Promise<{ results: SearchResult[]; metrics: SearchMetrics }>;

  /**
   * Generates embedding for query text via Ollama nomic-embed-text.
   */
  generateEmbedding(query: string): Promise<{ embedding: number[]; durationMs: number }>;

  /**
   * Queries Pinecone index using vector embedding and optional metadata filter.
   */
  searchVectors(
    vector: number[],
    topK?: number,
    filter?: Record<string, any>
  ): Promise<{ matches: PineconeMatchResult[]; durationMs: number }>;

  /**
   * Formats raw Pinecone matches into clean SearchResult DTOs.
   */
  formatResults(matches: PineconeMatchResult[]): SearchResult[];

  /**
   * Backward-compatible search method for prior art / RAG module.
   */
  searchPriorArt(dto: { query: string; topK?: number | undefined }): Promise<PriorArtMatchResult[]>;
}

/**
 * Search Repository Contract.
 */
export interface ISearchRepository {
  querySimilarity(
    vector: number[],
    topK: number,
    filter?: Record<string, any>
  ): Promise<PineconeMatchResult[]>;
}
