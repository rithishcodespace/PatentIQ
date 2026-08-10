import type { IVectorStoreProvider, VectorMatch } from './vectorstore-provider.interface.js';
export declare class PineconeVectorStoreProvider implements IVectorStoreProvider {
    private pineconeClient?;
    private indexName;
    constructor(apiKey?: string, indexName?: string);
    upsertVector(id: string, vector: number[], metadata?: Record<string, any>): Promise<void>;
    upsertBatchVectors(vectors: {
        id: string;
        vector: number[];
        metadata?: Record<string, any>;
    }[]): Promise<void>;
    querySimilarity(vector: number[], topK: number, filter?: Record<string, any>): Promise<VectorMatch[]>;
    deleteVector(id: string): Promise<void>;
}
//# sourceMappingURL=pinecone-vectorstore.provider.d.ts.map