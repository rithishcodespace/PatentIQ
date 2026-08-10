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
import type { IConfidenceService } from '../../confidence/interfaces/confidence.interface.js';
import { ConfidenceService } from '../../confidence/services/confidence.service.js';
import type { ICacheProvider } from '../../../providers/cache/cache-provider.interface.js';
import { RedisCacheProvider } from '../../../providers/cache/redis-cache.provider.js';

import { BM25SearchService } from './bm25-search.service.js';
import { RRFRerankerService } from './rrf-reranker.service.js';

export class SearchService implements ISearchService {
  private readonly embeddingProvider: IEmbeddingProvider;
  private readonly searchRepository: ISearchRepository;
  private readonly bm25Service: BM25SearchService;
  private readonly rrfReranker: RRFRerankerService;
  private readonly historyService?: IHistoryService | undefined;
  private readonly confidenceService: IConfidenceService;
  private readonly cacheProvider: ICacheProvider;

  constructor(
    embeddingProvider?: IEmbeddingProvider,
    searchRepository?: ISearchRepository,
    historyService?: IHistoryService,
    confidenceService?: IConfidenceService,
    cacheProvider?: ICacheProvider,
    bm25Service?: BM25SearchService,
    rrfReranker?: RRFRerankerService
  ) {
    this.embeddingProvider = embeddingProvider || new OllamaEmbeddingProvider();
    this.searchRepository = searchRepository || new SearchRepository();
    this.bm25Service = bm25Service || new BM25SearchService();
    this.rrfReranker = rrfReranker || new RRFRerankerService();
    this.historyService = historyService;
    this.confidenceService = confidenceService || new ConfidenceService();
    this.cacheProvider = cacheProvider || new RedisCacheProvider();
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
  /**
   * Queries vector index repository using query vector embedding and optional metadata filter.
   * Measures Pinecone search latency.
   */
  async searchVectors(
    vector: number[],
    topK: number = 10,
    filter?: Record<string, any>
  ): Promise<{ matches: PineconeMatchResult[]; durationMs: number }> {
    if (!vector || !Array.isArray(vector) || vector.length === 0) {
      throw new BadRequestError('Vector embedding array cannot be empty.');
    }
    if (topK < 1 || topK > 100) {
      throw new BadRequestError('maximum topK is 100');
    }

    const startTime = Date.now();
    try {
      const matches = await this.searchRepository.querySimilarity(vector, topK, filter);
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
   * Performs Precision Hybrid Search pipeline (Dense Vector + Sparse BM25 + Reciprocal Rank Fusion).
   */
  async executeSearch(
    queryText: string,
    topK: number = 100,
    filters?: import('../interfaces/search.interface.js').SearchFilter
  ): Promise<{ results: SearchResult[]; metrics: SearchMetrics }> {
    const totalStart = Date.now();

    const trimmed = queryText ? queryText.trim() : '';
    if (!trimmed) {
      throw new BadRequestError('Search query cannot be empty.');
    }

    // Construct Pinecone Metadata Filter (e.g. IPC classification filtering)
    let pineconeFilter: Record<string, any> | undefined = undefined;
    if (filters?.ipc) {
      const ipcList = Array.isArray(filters.ipc) ? filters.ipc : [filters.ipc];
      if (ipcList.length > 0) {
        pineconeFilter = { ipc: { $in: ipcList } };
      }
    }

    // 1. Stage 1: Dense Vector Retrieval via Pinecone
    const { embedding, durationMs: queryEmbeddingTimeMs } = await this.generateEmbedding(trimmed);
    const { matches, durationMs: pineconeSearchTimeMs } = await this.searchVectors(embedding, topK, pineconeFilter);

    // Format dense results
    const denseResults = SearchMapper.toSearchResultList(matches, topK);

    // 2. Stage 2: Sparse BM25 Lexical Keyword Matching (Technical Term & Part Number Boosted)
    const bm25Start = Date.now();
    const bm25Docs = denseResults.map((item) => ({
      id: item.vectorId || item.patentId,
      patentId: item.patentId,
      title: item.title,
      abstract: item.abstract,
      claims: item.claims,
      ipc: item.ipc,
    }));

    const sparseBM25Matches = this.bm25Service.rankDocuments(trimmed, bm25Docs, topK);
    const bm25SearchTimeMs = Date.now() - bm25Start;

    // 3. Stage 3: Reciprocal Rank Fusion (RRF) Reranking
    const rrfStart = Date.now();
    const finalResults = this.rrfReranker.fuseRanks(denseResults, sparseBM25Matches, { topK });
    const rrfRerankTimeMs = Date.now() - rrfStart;

    const totalExecutionTimeMs = Date.now() - totalStart;

    const metrics: SearchMetrics = {
      queryEmbeddingTimeMs,
      pineconeSearchTimeMs,
      bm25SearchTimeMs,
      rrfRerankTimeMs,
      totalExecutionTimeMs,
      totalResults: finalResults.length,
    };

    return { results: finalResults, metrics };
  }

  /**
   * Primary search entry point accepting a SearchRequest or query string.
   */
  async search(input: string | SearchRequest, topKParam?: number, filtersParam?: import('../interfaces/search.interface.js').SearchFilter): Promise<SearchResponse> {
    const totalStart = Date.now();
    const query = typeof input === 'string' ? input : input.query;
    const topK = typeof input === 'string' ? (topKParam ?? 10) : (input.topK ?? 10);
    const filters = typeof input === 'object' ? input.filters : filtersParam;

    const trimmedQuery = query ? query.trim() : '';
    if (!trimmedQuery) {
      throw new BadRequestError('query cannot be empty');
    }
    if (topK < 1 || topK > 100) {
      throw new BadRequestError('maximum topK is 100');
    }

    const cacheKey = RedisCacheProvider.createKey('search', { query: trimmedQuery, topK, filters });
    if (this.cacheProvider.isAvailable()) {
      const cached = await this.cacheProvider.get<SearchResponse>(cacheKey);
      if (cached) {
        console.log(`[SearchService] Cache HIT for query="${trimmedQuery}" | key="${cacheKey}"`);
        const cachedMetrics: SearchMetrics = {
          queryEmbeddingTimeMs: cached.metrics?.queryEmbeddingTimeMs ?? 0,
          pineconeSearchTimeMs: cached.metrics?.pineconeSearchTimeMs ?? 0,
          bm25SearchTimeMs: cached.metrics?.bm25SearchTimeMs ?? 0,
          rrfRerankTimeMs: cached.metrics?.rrfRerankTimeMs ?? 0,
          totalExecutionTimeMs: Date.now() - totalStart,
          totalResults: cached.metrics?.totalResults ?? cached.results.length,
        };
        return {
          ...cached,
          metrics: cachedMetrics,
        };
      }
    }

    const { results, metrics } = await this.executeSearch(trimmedQuery, topK, filters);

    const highestScore = results.length > 0 ? results[0]?.score ?? 0 : 0;

    console.log(
      `[SearchService] Search execution completed | query="${trimmedQuery}" | topK=${topK} | count=${results.length} | highestScore=${highestScore} | latency=${metrics.totalExecutionTimeMs}ms`
    );

    const retrievalConfidence = this.confidenceService.calculateRetrievalConfidence(results, topK);

    const response: SearchResponse = {
      success: true,
      query: trimmedQuery,
      count: results.length,
      confidence: {
        retrieval: retrievalConfidence,
      },
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

    if (this.cacheProvider.isAvailable()) {
      await this.cacheProvider.set(cacheKey, response);
    }

    return response;
  }

  /**
   * Helper method for RAG module prior art searches.
   */
  async searchPriorArt(dto: { query: string; topK?: number | undefined }): Promise<PriorArtMatchResult[]> {
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
