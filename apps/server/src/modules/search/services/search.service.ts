import type { ISearchService, ISearchRepository, SearchMetrics } from '../interfaces/search.interface.js';
import type { SearchRequestDto, SearchResponseDto, SearchResultDto, PriorArtMatchResult } from '../dto/search.dto.js';
import type { IEmbeddingProvider } from '../../../providers/embedding/embedding-provider.interface.js';
import { OllamaEmbeddingProvider } from '../../../providers/embedding/ollama-embedding.provider.js';
import { SearchRepository } from '../repositories/search.repository.js';
import { BadRequestError, InternalServerError } from '../../../common/errors/http-errors.js';

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
   * Main semantic patent search method.
   */
  async search(dto: SearchRequestDto): Promise<SearchResponseDto> {
    const totalStart = Date.now();

    const queryText = dto.query ? dto.query.trim() : '';
    if (!queryText) {
      throw new BadRequestError('Search query cannot be empty.');
    }

    const topK = dto.topK ?? 10;

    console.log(`[SearchService] [INFO] Query received: "${queryText}" (topK=${topK})`);

    // 1. Generate embedding using Ollama nomic-embed-text
    const embedStart = Date.now();
    let queryVector: number[];
    try {
      queryVector = await this.embeddingProvider.generateEmbedding(queryText);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[SearchService] [ERROR] Embedding generation failed: ${msg}`, err);
      throw new InternalServerError(`Embedding generation failed: ${msg}`);
    }
    const queryEmbeddingTimeMs = Date.now() - embedStart;
    console.log(`[SearchService] [INFO] Embedding generated (${queryVector.length} dims) in ${queryEmbeddingTimeMs}ms`);

    // 2. Query Pinecone Vector Index
    const pineconeStart = Date.now();
    let matches;
    try {
      matches = await this.searchRepository.querySimilarity(queryVector, topK);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[SearchService] [ERROR] Pinecone search failed: ${msg}`, err);
      throw new InternalServerError(`Vector database query failed: ${msg}`);
    }
    const pineconeSearchTimeMs = Date.now() - pineconeStart;
    console.log(`[SearchService] [INFO] Pinecone query completed in ${pineconeSearchTimeMs}ms (${matches.length} matches)`);

    // 3. Sort matches descending by similarity score
    const sortedMatches = [...matches].sort((a, b) => b.score - a.score);

    // 4. Transform Pinecone matches into SearchResultDto format
    const results: SearchResultDto[] = sortedMatches.map((match) => {
      const meta = match.metadata;
      const patentId = meta?.patentId || match.id.split('_')[0] || '';
      const ipc = meta?.ipc || '';
      const title = meta?.title || (meta?.section === 'title' ? `Patent ${patentId}` : '');
      const abstract = meta?.abstract || (meta?.section === 'abstract' ? `Abstract for patent ${patentId}` : '');

      return {
        patentId,
        title,
        abstract,
        ipc,
        score: parseFloat((match.score ?? 0).toFixed(4)),
      };
    });

    const totalExecutionTimeMs = Date.now() - totalStart;

    const metrics: SearchMetrics = {
      queryEmbeddingTimeMs,
      pineconeSearchTimeMs,
      totalExecutionTimeMs,
      totalResults: results.length,
    };

    console.log(
      `[SearchService] [INFO] Search finished in ${metrics.totalExecutionTimeMs}ms | Returned ${results.length} results`
    );

    return {
      success: true,
      query: queryText,
      count: results.length,
      results,
    };
  }

  /**
   * Backward-compatible helper method for RAG service prior art searches.
   */
  async searchPriorArt(dto: { query: string; topK?: number }): Promise<PriorArtMatchResult[]> {
    const response = await this.search(dto as SearchRequestDto);
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
