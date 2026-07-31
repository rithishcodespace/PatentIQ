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
import {
  BadRequestError,
  InternalServerError,
  ServiceUnavailableError,
  GatewayTimeoutError,
} from '../../../common/errors/http-errors.js';

export class SearchService implements ISearchService {
  private readonly embeddingProvider: IEmbeddingProvider;
  private readonly searchRepository: ISearchRepository;

  constructor(
    embeddingProvider?: IEmbeddingProvider,
    searchRepository?: ISearchRepository
  ) {
    this.embeddingProvider = embeddingProvider || new OllamaEmbeddingProvider();
    this.searchRepository = searchRepository || new SearchRepository();
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
   * Sorts raw Pinecone matches descending by similarity score
   * and transforms match metadata into clean SearchResult DTO objects.
   */
  formatResults(matches: PineconeMatchResult[]): SearchResult[] {
    const sorted = [...matches].sort((a, b) => b.score - a.score);

    return sorted.map((match) => {
      const meta = match.metadata as PineconeVectorMetadata | undefined;
      const patentId = meta?.patentId || match.id.split('_')[0] || '';
      const ipc = meta?.ipc || '';
      const title = meta?.title || (meta?.section === 'title' ? `Patent ${patentId}` : '');
      const abstract = meta?.abstract || (meta?.section === 'abstract' ? `Abstract for patent ${patentId}` : '');
      const publicationDate = meta?.publicationDate || (meta as any)?.date || undefined;
      const owner = meta?.owner || meta?.assignee || undefined;

      const result: SearchResult = {
        patentId,
        title,
        abstract,
        ipc,
        score: parseFloat((match.score ?? 0).toFixed(4)),
      };

      if (publicationDate) {
        result.publicationDate = String(publicationDate);
      }
      if (owner) {
        result.owner = String(owner);
      }

      return result;
    });
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

    // 3. Format and Sort Matches
    const results = this.formatResults(matches);

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

    const trimmedQuery = query ? query.trim() : '';
    if (!trimmedQuery) {
      throw new BadRequestError('query cannot be empty');
    }
    if (topK < 1 || topK > 100) {
      throw new BadRequestError('maximum topK is 100');
    }

    console.log(`[SearchService] Executing semantic search for query: "${trimmedQuery}" (topK=${topK})`);

    const { results, metrics } = await this.executeSearch(trimmedQuery, topK);

    console.log(
      `[SearchService] Search finished in ${metrics.totalExecutionTimeMs}ms | Embedding: ${metrics.queryEmbeddingTimeMs}ms | Pinecone: ${metrics.pineconeSearchTimeMs}ms | Results: ${results.length}`
    );

    return {
      success: true,
      query: trimmedQuery,
      count: results.length,
      results,
      metrics,
    };
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
