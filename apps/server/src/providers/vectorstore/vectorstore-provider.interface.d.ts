export interface VectorMatch {
    id: string;
    score: number;
    metadata?: Record<string, any>;
}
export interface IVectorStoreProvider {
    upsertVector(id: string, vector: number[], metadata?: Record<string, any>): Promise<void>;
    upsertBatchVectors(vectors: {
        id: string;
        vector: number[];
        metadata?: Record<string, any>;
    }[]): Promise<void>;
    querySimilarity(vector: number[], topK: number, filter?: Record<string, any>): Promise<VectorMatch[]>;
    deleteVector(id: string): Promise<void>;
}
//# sourceMappingURL=vectorstore-provider.interface.d.ts.map