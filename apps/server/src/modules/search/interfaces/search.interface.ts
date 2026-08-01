import type { RecordMetadata } from '@pinecone-database/pinecone';
import type { SearchRequestDto, SearchResponseDto, SearchResultDto, PriorArtMatchResult } from '../dto/search.dto.js';

/**
 * Metadata stored inside Pinecone vector records.
 */
export interface PineconeVectorMetadata extends RecordMetadata {
  patentId: string;
  section?: 'title' | 'abstract' | 'claims' | string;
  ipc: string;
  title?: string;
  abstract?: string;
  claims?: string;
  publicationDate?: string;
  owner?: string;
  assignee?: string;
  country?: string;
}

/**
 * Metadata search filter criteria for Pinecone queries.
 */
export interface SearchFilter {
  ipc?: string | undefined;
  country?: string | undefined;
  publicationDate?: string | undefined;
  publicationDateFrom?: string | undefined;
  publicationDateTo?: string | undefined;
  owner?: string | undefined;
  section?: 'title' | 'abstract' | 'claims' | undefined;
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
 * Interface alias for Pinecone vector match.
 */
export type PineconeMatch = PineconeMatchResult;

/**
 * Interface representing a formatted patent search result.
 */
export interface SearchResult {
  rank: number;
  score: number;
  patentId: string;
  title: string;
  abstract: string;
  claims?: string | undefined;
  ipc: string;
  country?: string | undefined;
  owner?: string | undefined;
  publicationDate?: string | undefined;
  section?: string | undefined;
  vectorId?: string | undefined;
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
}

/**
 * Execution metrics for search performance breakdown.
 */
export interface SearchMetrics {
  queryEmbeddingTimeMs: number;
  pineconeSearchTimeMs: number;
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
