import type { SearchMetrics } from '../../search/interfaces/search.interface.js';
/**
 * Interface representing a CLI ranked result item for printing.
 */
export interface SearchResultItem {
    rank: number;
    patentId: string;
    section: 'title' | 'abstract' | 'claims' | string;
    score: number;
    ipc: string;
    vectorId: string;
}
/**
 * Re-export SearchMetrics for script compatibility.
 */
export type { SearchMetrics };
/**
 * Thin CLI testing wrapper for Patent Semantic Search.
 * Contains zero business logic; delegates search execution to SearchService.
 */
export declare class PatentSemanticSearcher {
    private searchService;
    constructor(ollamaBaseUrl?: string, embeddingModel?: string, pineconeApiKey?: string, pineconeIndexName?: string, maxRetries?: number, _mockMode?: boolean);
    /**
     * Delegates search execution to SearchService.
     */
    executeSearch(queryText: string, topK?: number): Promise<{
        results: SearchResultItem[];
        metrics: SearchMetrics;
    }>;
    /**
     * Prints formatted search results to stdout.
     */
    printResults(queryText: string, results: SearchResultItem[], metrics: SearchMetrics): void;
}
//# sourceMappingURL=semanticSearch.d.ts.map