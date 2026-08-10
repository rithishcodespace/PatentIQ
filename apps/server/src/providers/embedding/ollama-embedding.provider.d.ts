import type { IEmbeddingProvider } from './embedding-provider.interface.js';
export declare class OllamaEmbeddingProvider implements IEmbeddingProvider {
    private ollama;
    private model;
    private maxRetries;
    private dimensions;
    constructor(baseUrl?: string, model?: string, maxRetries?: number, dimensions?: number);
    getModelName(): string;
    getDimension(): number;
    private retryWithBackoff;
    generateEmbedding(text: string): Promise<number[]>;
    generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
}
//# sourceMappingURL=ollama-embedding.provider.d.ts.map