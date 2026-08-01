import type {
  ISearchService,
  ISearchRepository,
  PineconeMatchResult,
  SearchMetrics,
  SearchRequest,
  SearchResponse,
  SearchResult,
  PineconeVectorMetadata,
} from '../interfaces/search.interface.js';
import type { PriorArtMatchResult } from '../dto/search.dto.js';
import type { IEmbeddingProvider } from '../../../providers/embedding/embedding-provider.interface.js';
import { OllamaEmbeddingProvider } from '../../../providers/embedding/ollama-embedding.provider.js';
import { SearchRepository } from '../repositories/search.repository.js';
import { SearchMapper } from '../mappers/search.mapper.js';
import {
  BadRequestError,
  InternalServerError,
  ServiceUnavailableError,
  GatewayTimeoutError,
} from '../../../common/errors/http-errors.js';

import type { IHistoryService } from '../../history/interfaces/history.interface.js';

export class SearchService implements ISearchService {
  private readonly embeddingProvider: IEmbeddingProvider;
  private readonly searchRepository: ISearchRepository;
  private readonly historyService?: IHistoryService | undefined;

  constructor(
    embeddingProvider?: IEmbeddingProvider,
    searchRepository?: ISearchRepository,
    historyService?: IHistoryService
  ) {
    this.embeddingProvider = embeddingProvider || new OllamaEmbeddingProvider();
    this.searchRepository = searchRepository || new SearchRepository();
    this.historyService = historyService;
  }

  /**
   * Generates embedding for query prompt via Ollama (nomic-embed-text).
   * Measures embedding generation latency and handles Ollama errors.
   */
  async generateEmbedding(query: string): Promise<{ embedding: number[]; durationMs: number }> {
    const trimmed = query ? query.trim() : '';
    if (!trimmed) {
      throw new BadRequestError('query cannot be empty');
    }

    const startTime = Date.now();
    try {
      const embedding = await this.embeddingProvider.generateEmbedding(trimmed);
      const durationMs = Date.now() - startTime;
      return { embedding, durationMs };
    } catch (err: unknown) {
      if (
        err instanceof BadRequestError ||
        err instanceof ServiceUnavailableError ||
        err instanceof GatewayTimeoutError
      ) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[SearchService] [ERROR] Ollama embedding generation failed: ${msg}`, err);

      if (msg.includes('ECONNREFUSED') || msg.toLowerCase().includes('fetch failed') || msg.toLowerCase().includes('connect')) {
        throw new ServiceUnavailableError(`Ollama service is unavailable: ${msg}`);
      }
      if (msg.includes('ETIMEDOUT') || msg.toLowerCase().includes('timeout')) {
        throw new GatewayTimeoutError(`Ollama embedding generation timed out: ${msg}`);
      }
      throw new InternalServerError(`Ollama embedding generation failed: ${msg}`);
    }
  }

  /**
   * Queries vector index repository using query vector embedding.
   * Measures Pinecone search latency.
   */
  async searchVectors(
    vector: number[],
    topK: number = 10
  ): Promise<{ matches: PineconeMatchResult[]; durationMs: number }> {
    if (!vector || !Array.isArray(vector) || vector.length === 0) {
      throw new BadRequestError('Vector embedding array cannot be empty.');
    }
    if (topK < 1 || topK > 100) {
      throw new BadRequestError('maximum topK is 100');
    }

    const startTime = Date.now();
    try {
      const matches = await this.searchRepository.querySimilarity(vector, topK);
      const durationMs = Date.now() - startTime;
      return { matches, durationMs };
    } catch (err: unknown) {
      if (
        err instanceof BadRequestError ||
        err instanceof ServiceUnavailableError ||
        err instanceof GatewayTimeoutError
      ) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[SearchService] [ERROR] Pinecone vector search failed: ${msg}`, err);
      throw new InternalServerError(`Pinecone vector database search failed: ${msg}`);
    }
  }

  /**
   * Delegates match transformation, score sorting, score rounding (4 decimal places),
   * and 1-based ranking position assignment to SearchMapper.
   */
  formatResults(matches: PineconeMatchResult[]): SearchResult[] {
    return SearchMapper.toSearchResultList(matches);
  }

  /**
   * Performs end-to-end semantic search pipeline returning results and timing metrics.
   */
  async executeSearch(
    queryText: string,
    topK: number = 100
  ): Promise<{ results: SearchResult[]; metrics: SearchMetrics }> {
    const totalStart = Date.now();

    const trimmed = queryText ? queryText.trim() : '';
    if (!trimmed) {
      throw new BadRequestError('Search query cannot be empty.');
    }

    // 1. Generate Query Embedding via Ollama
    const { embedding, durationMs: queryEmbeddingTimeMs } = await this.generateEmbedding(trimmed);

    // 2. Query Vector Store (Pinecone)
    const { matches, durationMs: pineconeSearchTimeMs } = await this.searchVectors(embedding, topK);

    // 3. Format, Sort, Rank, and Round Matches via SearchMapper
    const results = SearchMapper.toSearchResultList(matches, topK);

    const totalExecutionTimeMs = Date.now() - totalStart;

    const metrics: SearchMetrics = {
      queryEmbeddingTimeMs,
      pineconeSearchTimeMs,
      totalExecutionTimeMs,
      totalResults: results.length,
    };

    return { results, metrics };
  }

  /**
   * Primary search entry point accepting a SearchRequest or query string.
   */
  async search(input: string | SearchRequest, topKParam?: number): Promise<SearchResponse> {
    const query = typeof input === 'string' ? input : input.query;
    const topK = typeof input === 'string' ? (topKParam ?? 10) : (input.topK ?? 10);
    const filters = typeof input === 'object' ? input.filters : undefined;

    const trimmedQuery = query ? query.trim() : '';
    if (!trimmedQuery) {
      throw new BadRequestError('query cannot be empty');
    }
    if (topK < 1 || topK > 100) {
      throw new BadRequestError('maximum topK is 100');
    }

    const { results, metrics } = await this.executeSearch(trimmedQuery, topK);

    const highestScore = results.length > 0 ? results[0]?.score ?? 0 : 0;

    console.log(
      `[SearchService] Search execution completed | query="${trimmedQuery}" | topK=${topK} | count=${results.length} | highestScore=${highestScore} | latency=${metrics.totalExecutionTimeMs}ms`
    );

    const response: SearchResponse = {
      success: true,
      query: trimmedQuery,
      count: results.length,
      results,
      metrics,
    };

    if (filters) {
      response.filters = filters;
    }

    if (this.historyService) {
      try {
        const historyRecord = await this.historyService.saveSearchHistory({
          searchQuery: trimmedQuery,
          topK,
          appliedFilters: filters ? (filters as any) : null,
          totalResults: results.length,
          searchLatency: metrics.totalExecutionTimeMs,
          retrievedPatents: results.map((r) => ({
            patentId: r.patentId,
            title: r.title || `Patent ${r.patentId}`,
            similarityScore: r.score,
            ipc: r.ipc,
            country: r.country,
            publicationDate: r.publicationDate,
            owner: r.owner,
            metadata: { section: r.section, abstract: r.abstract },
          })),
        });
        if (historyRecord?.id) {
          response.searchHistoryId = historyRecord.id;
        }
      } catch (err: any) {
        console.warn(`[SearchService] Failed to persist search history: ${err.message}`);
      }
    }

    return response;
  }

  /**
   * Helper method for RAG module prior art searches.
   */
  async searchPriorArt(dto: { query: string; topK?: number }): Promise<PriorArtMatchResult[]> {
    const response = await this.search(dto.query, dto.topK ?? 100);
    return response.results.map((r, idx) => ({
      patentId: r.patentId,
      patentNumber: r.patentId,
      title: r.title || `Prior Art Patent ${idx + 1}`,
      abstract: r.abstract || '',
      similarityScore: r.score,
      ipcClassifications: r.ipc ? [r.ipc] : [],
    }));
  }
}
