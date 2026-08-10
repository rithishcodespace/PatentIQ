export declare function createPineconeMock(matches?: {
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
}[]): {
    pineconeClientMock: {
        index: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    indexMock: import("vitest").Mock<import("@vitest/spy").Procedure>;
    queryMock: import("vitest").Mock<import("@vitest/spy").Procedure>;
};
//# sourceMappingURL=pinecone.mock.d.ts.map