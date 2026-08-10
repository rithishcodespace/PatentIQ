export interface IEmbeddingProvider {
    generateEmbedding(text: string): Promise<number[]>;
    generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
    getModelName(): string;
    getDimension(): number;
}
//# sourceMappingURL=embedding-provider.interface.d.ts.map