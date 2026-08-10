/**
 * Interface representing vector section metadata stored in Pinecone.
 */
export interface PatentVectorMetadata {
    patentId: string;
    section: 'title' | 'abstract' | 'claims';
    ipc: string;
    [key: string]: string;
}
/**
 * Input format read from patent_embeddings.json.
 */
export interface PatentEmbeddingRecord {
    patentId: string;
    ipc: string;
    embeddings: {
        title?: number[];
        abstract?: number[];
        claims?: number[];
    };
}
/**
 * Upload configuration options.
 */
export interface UploadOptions {
    inputPath: string;
    batchSize?: number;
    maxRetries?: number;
    apiKey?: string;
    indexName?: string;
    dryRun?: boolean;
}
/**
 * Upload metrics and statistics.
 */
export interface UploadStats {
    totalVectorsProcessed: number;
    totalVectorsUploaded: number;
    failedUploads: number;
    durationSeconds: number;
    averageSpeedVectorsPerSec: number;
    startTime: number;
    endTime: number;
}
/**
 * Pinecone Vector Uploader Service.
 */
export declare class PineconePatentUploader {
    private pineconeClient?;
    private indexName;
    private maxRetries;
    private isDryRun;
    constructor(apiKey?: string, indexName?: string, maxRetries?: number, dryRun?: boolean);
    /**
     * Retries async operations with exponential backoff.
     */
    private retryWithBackoff;
    /**
     * Upserts a batch of vector records to Pinecone index.
     */
    private uploadBatch;
    /**
     * Reads section embeddings from input file and uploads vector records to Pinecone in batches.
     */
    uploadEmbeddings(options: UploadOptions): Promise<UploadStats>;
    /**
     * Prints final summary report upon upload completion.
     */
    private printSummaryReport;
}
//# sourceMappingURL=uploadToPinecone.d.ts.map