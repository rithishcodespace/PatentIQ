import type { IEmbeddingProvider } from '../../../providers/embedding/embedding-provider.interface.js';
/**
 * Interface representing input patent record from patents.json.
 */
export interface InputPatentRecord {
    patentId: string;
    title: string;
    abstract: string;
    claims: string;
    ipc: string;
    ipcVersion?: string;
    publicationDate?: string;
    applicationNumber?: string;
    applicationDate?: string;
}
/**
 * Interface representing section-wise embedding output format.
 */
export interface PatentEmbeddingOutput {
    patentId: string;
    ipc: string;
    embeddings: {
        title: number[];
        abstract: number[];
        claims: number[];
    };
}
/**
 * Options for section embedding generation.
 */
export interface GeneratorOptions {
    inputPath: string;
    outputPath: string;
    ollamaBaseUrl?: string;
    modelName?: string;
    batchSize?: number;
    maxRetries?: number;
    logInterval?: number;
}
/**
 * Performance and metrics statistics.
 */
export interface GeneratorStats {
    totalProcessed: number;
    durationSeconds: number;
    avgTimePerPatentMs: number;
    throughputPatentsPerSec: number;
    startTime: number;
    endTime: number;
}
/**
 * Patent Section Embedding Generator reusing standard OllamaEmbeddingProvider.
 */
export declare class PatentEmbeddingGenerator {
    private embeddingProvider;
    private modelName;
    constructor(baseUrl?: string, modelName?: string, maxRetries?: number, provider?: IEmbeddingProvider);
    /**
     * Generates section-wise embeddings (title, abstract, claims) for a batch of patent records
     * by delegating batch embedding generation to OllamaEmbeddingProvider.
     */
    processPatentBatch(patents: InputPatentRecord[]): Promise<PatentEmbeddingOutput[]>;
    /**
     * Executes embedding generation pipeline over input patents JSON file.
     */
    generateEmbeddings(options: GeneratorOptions): Promise<GeneratorStats>;
    /**
     * Prints final summary report upon embedding completion.
     */
    private printSummaryReport;
}
//# sourceMappingURL=generateEmbeddings.d.ts.map