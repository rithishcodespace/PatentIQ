import { PrismaClient } from '@prisma/client';
export interface IngestionOptions {
    rawDir?: string;
    maxFiles?: number;
    batchSize?: number;
    generateEmbeddings?: boolean;
    ollamaBaseUrl?: string;
    prisma?: PrismaClient;
}
export interface IngestionStats {
    totalFilesProcessed: number;
    totalPatentsIngested: number;
    totalEmbeddingsGenerated: number;
    durationSeconds: number;
}
export declare function runPatentIngestionScript(options?: IngestionOptions): Promise<IngestionStats>;
//# sourceMappingURL=patent-ingestion.script.d.ts.map