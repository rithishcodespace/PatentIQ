import type { SearchResult, BM25MatchResult } from '../interfaces/search.interface.js';
export interface RRFOptions {
    k?: number | undefined;
    vectorWeight?: number | undefined;
    bm25Weight?: number | undefined;
    topK?: number | undefined;
}
export declare class RRFRerankerService {
    private readonly defaultK;
    private readonly defaultVectorWeight;
    private readonly defaultBm25Weight;
    constructor(k?: number, vectorWeight?: number, bm25Weight?: number);
    /**
     * Reciprocal Rank Fusion algorithm merging dense vector search results and sparse BM25 lexical results.
     */
    fuseRanks(denseResults: SearchResult[], sparseResults: BM25MatchResult[], options?: RRFOptions): SearchResult[];
}
//# sourceMappingURL=rrf-reranker.service.d.ts.map