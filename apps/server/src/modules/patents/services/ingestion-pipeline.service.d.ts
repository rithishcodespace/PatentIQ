import { PrismaClient } from '@prisma/client';
import { PatentParserService } from './patent-parser.service.js';
import { OllamaEmbeddingProvider } from '../../../providers/embedding/ollama-embedding.provider.js';
import { PineconeVectorStoreProvider } from '../../../providers/vectorstore/pinecone-vectorstore.provider.js';
export interface IngestionPipelineOptions {
    rawDir?: string | undefined;
    batchSize?: number | undefined;
    maxRetries?: number | undefined;
    autoScheduleEnabled?: boolean | undefined;
    scheduleIntervalMinutes?: number | undefined;
}
export interface IngestionPipelineStatus {
    status: 'idle' | 'running' | 'completed' | 'failed';
    stage: 'idle' | 'dataset_discovery' | 'parsing_database_sync' | 'embedding_generation' | 'pinecone_vector_sync';
    progressPercent: number;
    processedCount: number;
    totalCount: number;
    errorCount: number;
    currentFile?: string | undefined;
    lastRunTimestamp?: Date | undefined;
    nextScheduledRunTimestamp?: Date | undefined;
    lastRunDurationSeconds?: number | undefined;
    logs: string[];
}
export declare class IngestionPipelineService {
    private prisma;
    private parserService;
    private embeddingProvider;
    private vectorStoreProvider;
    private scheduleTimer;
    private isRunning;
    private statusState;
    constructor(prisma?: PrismaClient, parserService?: PatentParserService, embeddingProvider?: OllamaEmbeddingProvider, vectorStoreProvider?: PineconeVectorStoreProvider);
    /**
     * Returns current real-time status of the ingestion pipeline.
     */
    getPipelineStatus(): IngestionPipelineStatus;
    /**
     * Appends log messages to pipeline status buffer.
     */
    private log;
    /**
     * Executes full dataset synchronization & ingestion pipeline asynchronously with retry logic.
     */
    triggerPipelineRun(options?: IngestionPipelineOptions): Promise<IngestionPipelineStatus>;
    /**
     * Configures or toggles automated interval timer for continuous dataset synchronization.
     */
    configureSchedule(intervalMinutes: number, enabled: boolean): void;
    /**
     * Stops active schedule timer on service teardown.
     */
    stopSchedule(): void;
}
//# sourceMappingURL=ingestion-pipeline.service.d.ts.map