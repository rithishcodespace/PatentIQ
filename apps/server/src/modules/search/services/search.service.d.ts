import type { ISearchService, ISearchRepository, PineconeMatchResult, SearchMetrics, SearchRequest, SearchResponse, SearchResult } from '../interfaces/search.interface.js';
import type { PriorArtMatchResult } from '../dto/search.dto.js';
import type { IEmbeddingProvider } from '../../../providers/embedding/embedding-provider.interface.js';
import type { IHistoryService } from '../../history/interfaces/history.interface.js';
import type { IConfidenceService } from '../../confidence/interfaces/confidence.interface.js';
import type { ICacheProvider } from '../../../providers/cache/cache-provider.interface.js';
import { BM25SearchService } from './bm25-search.service.js';
import { RRFRerankerService } from './rrf-reranker.service.js';
export declare class SearchService implements ISearchService {
    private readonly embeddingProvider;
    private readonly searchRepository;
    private readonly bm25Service;
    private readonly rrfReranker;
    private readonly historyService?;
    private readonly confidenceService;
    private readonly cacheProvider;
    constructor(embeddingProvider?: IEmbeddingProvider, searchRepository?: ISearchRepository, historyService?: IHistoryService, confidenceService?: IConfidenceService, cacheProvider?: ICacheProvider, bm25Service?: BM25SearchService, rrfReranker?: RRFRerankerService);
    /**
     * Generates embedding for query prompt via Ollama (nomic-embed-text).
     * Measures embedding generation latency and handles Ollama errors.
     */
    generateEmbedding(query: string): Promise<{
        embedding: number[];
        durationMs: number;
    }>;
    /**
     * Queries vector index repository using query vector embedding.
     * Measures Pinecone search latency.
     */
    /**
     * Queries vector index repository using query vector embedding and optional metadata filter.
     * Measures Pinecone search latency.
     */
    searchVectors(vector: number[], topK?: number, filter?: Record<string, any>): Promise<{
        matches: PineconeMatchResult[];
        durationMs: number;
    }>;
    /**
     * Delegates match transformation, score sorting, score rounding (4 decimal places),
     * and 1-based ranking position assignment to SearchMapper.
     */
    formatResults(matches: PineconeMatchResult[]): SearchResult[];
    /**
     * Performs Precision Hybrid Search pipeline (Dense Vector + Sparse BM25 + Reciprocal Rank Fusion).
     */
    executeSearch(queryText: string, topK?: number, filters?: import('../interfaces/search.interface.js').SearchFilter): Promise<{
        results: SearchResult[];
        metrics: SearchMetrics;
    }>;
    /**
     * Primary search entry point accepting a SearchRequest or query string.
     */
    search(input: string | SearchRequest, topKParam?: number, filtersParam?: import('../interfaces/search.interface.js').SearchFilter): Promise<SearchResponse>;
    /**
     * Helper method for RAG module prior art searches.
     */
    searchPriorArt(dto: {
        query: string;
        topK?: number | undefined;
    }): Promise<PriorArtMatchResult[]>;
}
//# sourceMappingURL=search.service.d.ts.map