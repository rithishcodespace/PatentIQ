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
}

/**
 * Raw match returned from Pinecone query.
 */
export interface PineconeMatchResult {
  id: string;
  score: number;
  metadata?: PineconeVectorMetadata | undefined;
}

/**
 * Interface representing a ranked search result.
 */
export interface SearchResult {
  patentId: string;
  title: string;
  abstract: string;
  ipc: string;
  score: number;
}

/**
 * Execution metrics for search performance logging.
 */
export interface SearchMetrics {
  queryEmbeddingTimeMs: number;
  pineconeSearchTimeMs: number;
  totalExecutionTimeMs: number;
  totalResults: number;
}

/**
 * Search Service Contract.
 */
export interface ISearchService {
  search(dto: SearchRequestDto): Promise<SearchResponseDto>;
  searchPriorArt(dto: { query: string; topK?: number }): Promise<PriorArtMatchResult[]>;
}

/**
 * Search Repository Contract.
 */
export interface ISearchRepository {
  querySimilarity(vector: number[], topK: number): Promise<PineconeMatchResult[]>;
}
