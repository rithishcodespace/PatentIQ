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
  publicationDate?: string;
  owner?: string;
  assignee?: string;
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
  patentId: string;
  title: string;
  abstract: string;
  ipc: string;
  score: number;
  publicationDate?: string;
  owner?: string;
}

/**
 * Interface representing incoming search request.
 */
export interface SearchRequest {
  query: string;
  topK?: number;
}

/**
 * Interface representing formatted search response.
 */
export interface SearchResponse {
  success: boolean;
  query: string;
  count: number;
  results: SearchResult[];
  metrics?: SearchMetrics;
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
  search(input: string | SearchRequest, topK?: number): Promise<SearchResponse>;

  /**
   * End-to-end execution returning detailed results and execution metrics.
   */
  executeSearch(query: string, topK?: number): Promise<{ results: SearchResult[]; metrics: SearchMetrics }>;

  /**
   * Generates embedding for query text via Ollama nomic-embed-text.
   */
  generateEmbedding(query: string): Promise<{ embedding: number[]; durationMs: number }>;

  /**
   * Queries Pinecone index using vector embedding.
   */
  searchVectors(vector: number[], topK: number): Promise<{ matches: PineconeMatchResult[]; durationMs: number }>;

  /**
   * Formats raw Pinecone matches into clean SearchResult DTOs.
   */
  formatResults(matches: PineconeMatchResult[]): SearchResult[];

  /**
   * Backward-compatible search method for prior art / RAG module.
   */
  searchPriorArt(dto: { query: string; topK?: number }): Promise<PriorArtMatchResult[]>;
}

/**
 * Search Repository Contract.
 */
export interface ISearchRepository {
  querySimilarity(vector: number[], topK: number): Promise<PineconeMatchResult[]>;
}
