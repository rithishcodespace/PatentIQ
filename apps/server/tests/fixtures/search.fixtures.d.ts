import type { SearchRequest, SearchResponse, SearchResult } from '../../src/modules/search/interfaces/search.interface.js';
export declare const mockSearchQuery = "Autonomous drone navigation using LiDAR and optical flow sensors";
export declare const mockSearchRequest: SearchRequest;
export declare const mockVectorEmbedding: any[];
export declare const mockPineconeMatches: {
    id: string;
    score: number;
    metadata: {
        patentId: string;
        patent_id: string;
        title: string;
        abstract: string;
        claims: string;
        ipc: string;
        country: string;
        owner: string;
        publication_date: string;
        section: string;
    };
}[];
export declare const mockSearchResults: SearchResult[];
export declare const mockSearchResponse: SearchResponse;
//# sourceMappingURL=search.fixtures.d.ts.map