import type { ISearchRepository, PineconeMatchResult } from '../interfaces/search.interface.js';
export declare class SearchRepository implements ISearchRepository {
    private pineconeClient?;
    private indexName;
    private maxRetries;
    constructor(apiKey?: string, indexName?: string, maxRetries?: number);
    /**
     * Retries an async operation with exponential backoff.
     */
    private retryWithBackoff;
    /**
     * Queries Pinecone vector database using query vector and optional metadata filters.
     */
    querySimilarity(queryVector: number[], topK: number, filter?: Record<string, any>): Promise<PineconeMatchResult[]>;
}
//# sourceMappingURL=search.repository.d.ts.map