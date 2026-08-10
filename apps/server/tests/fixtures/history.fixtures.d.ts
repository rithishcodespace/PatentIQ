export declare const mockHistoryRecordId = "a540aa40-a25c-427c-8848-dea943861a3a";
export declare const mockHistoryRecord: {
    id: string;
    userId: string;
    searchQuery: string;
    topK: number;
    appliedFilters: {
        ipc: string;
        country: string;
    };
    totalResults: number;
    searchLatency: number;
    createdAt: Date;
    retrievedPatents: {
        id: string;
        searchHistoryId: string;
        patentId: string;
        title: string;
        similarityScore: number;
        ipc: string;
        country: string;
        publicationDate: string;
        owner: string;
        metadata: {};
    }[];
    noveltyAnalysis: {
        id: string;
        searchHistoryId: string;
        summary: string;
        novelty: string;
        overlappingClaims: string[];
        recommendations: string[];
        confidenceScore: number;
        rawLLMResponse: string;
        generatedAt: Date;
    };
};
//# sourceMappingURL=history.fixtures.d.ts.map