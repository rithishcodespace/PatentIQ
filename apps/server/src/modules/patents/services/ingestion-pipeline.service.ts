import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

export class IngestionPipelineService {
  private prisma: PrismaClient;
  private parserService: PatentParserService;
  private embeddingProvider: OllamaEmbeddingProvider;
  private vectorStoreProvider: PineconeVectorStoreProvider;
  private scheduleTimer: NodeJS.Timeout | null = null;
  private isRunning = false;

  private statusState: IngestionPipelineStatus = {
    status: 'idle',
    stage: 'idle',
    progressPercent: 0,
    processedCount: 0,
    totalCount: 0,
    errorCount: 0,
    logs: [],
  };

  constructor(
    prisma?: PrismaClient,
    parserService?: PatentParserService,
    embeddingProvider?: OllamaEmbeddingProvider,
    vectorStoreProvider?: PineconeVectorStoreProvider
  ) {
    this.prisma = prisma || new PrismaClient();
    this.parserService = parserService || new PatentParserService();
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.embeddingProvider = embeddingProvider || new OllamaEmbeddingProvider(ollamaUrl, 'nomic-embed-text', 3);
    this.vectorStoreProvider = vectorStoreProvider || new PineconeVectorStoreProvider();
  }

  /**
   * Returns current real-time status of the ingestion pipeline.
   */
  getPipelineStatus(): IngestionPipelineStatus {
    return { ...this.statusState };
  }

  /**
   * Appends log messages to pipeline status buffer.
   */
  private log(message: string): void {
    const formatted = `[${new Date().toISOString()}] ${message}`;
    console.log(`[IngestionPipeline] ${message}`);
    this.statusState.logs = [...this.statusState.logs.slice(-99), formatted];
  }

  /**
   * Executes full dataset synchronization & ingestion pipeline asynchronously with retry logic.
   */
  async triggerPipelineRun(options: IngestionPipelineOptions = {}): Promise<IngestionPipelineStatus> {
    if (this.isRunning) {
      this.log('Pipeline run requested while already running. Returning current status.');
      return this.getPipelineStatus();
    }

    this.isRunning = true;
    const startTime = Date.now();
    const batchSize = options.batchSize || 20;
    const maxRetries = options.maxRetries || 3;

    const currentFilePath = fileURLToPath(import.meta.url);
    const scriptsDir = path.dirname(currentFilePath);
    const defaultRawDir = path.resolve(scriptsDir, '../dataset/raw');
    const rawDir = options.rawDir || defaultRawDir;

    this.statusState = {
      status: 'running',
      stage: 'dataset_discovery',
      progressPercent: 0,
      processedCount: 0,
      totalCount: 0,
      errorCount: 0,
      lastRunTimestamp: new Date(),
      logs: [],
    };

    this.log(`Initiating automated batch ingestion pipeline... (Raw Directory: ${rawDir})`);

    // Run async execution loop in background
    setTimeout(async () => {
      try {
        // Stage 1: Dataset Discovery
        if (!fs.existsSync(rawDir)) {
          fs.mkdirSync(rawDir, { recursive: true });
        }

        const entries = fs.readdirSync(rawDir, { withFileTypes: true });
        const rawFiles = entries
          .filter((e) => e.isFile() && !e.name.startsWith('.'))
          .map((e) => path.join(rawDir, e.name));

        this.statusState.totalCount = rawFiles.length;
        this.statusState.stage = 'parsing_database_sync';
        this.log(`Discovered ${rawFiles.length} dataset files for automated ingestion.`);

        if (rawFiles.length === 0) {
          this.statusState.status = 'completed';
          this.statusState.stage = 'idle';
          this.statusState.progressPercent = 100;
          this.statusState.lastRunDurationSeconds = (Date.now() - startTime) / 1000;
          this.log('No raw files present in directory. Pipeline completed.');
          this.isRunning = false;
          return;
        }

        // Stage 2 & 3: File Ingestion & Vector Embedding with Retry Logic
        for (let i = 0; i < rawFiles.length; i += batchSize) {
          const batchFiles = rawFiles.slice(i, i + batchSize);

          for (const filePath of batchFiles) {
            const fileName = path.basename(filePath);
            this.statusState.currentFile = fileName;
            this.log(`Processing file [${this.statusState.processedCount + 1}/${rawFiles.length}]: ${fileName}`);

            let attempt = 0;
            let success = false;

            while (attempt < maxRetries && !success) {
              attempt++;
              try {
                const ext = path.extname(filePath).toLowerCase();
                const stats = fs.statSync(filePath);

                let patentSection;
                let mimeType = 'text/plain';

                if (ext === '.pdf') {
                  mimeType = 'application/pdf';
                  const buffer = fs.readFileSync(filePath);
                  patentSection = await this.parserService.parsePdf(buffer);
                } else if (ext === '.docx') {
                  mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                  const buffer = fs.readFileSync(filePath);
                  patentSection = await this.parserService.parseDocx(buffer);
                } else {
                  const textContent = fs.readFileSync(filePath, 'utf-8');
                  patentSection = await this.parserService.parseCsvOrText(textContent);
                }

                // Database Persistence via Prisma
                await this.prisma.uploadedDocument.create({
                  data: {
                    originalFileName: fileName,
                    storedFileName: `ingested_${Date.now()}_${fileName}`,
                    mimeType,
                    extension: ext.replace('.', '') || 'txt',
                    size: stats.size,
                    storagePath: filePath,
                    status: 'Completed',
                  },
                });

                // Generate vector embedding
                if (patentSection.abstract) {
                  this.statusState.stage = 'embedding_generation';
                  const textToEmbed = `${patentSection.title}. ${patentSection.abstract}`;
                  const embeddingVector = await this.embeddingProvider.generateEmbedding(textToEmbed);

                  // Upload to Pinecone Vector Store
                  if (embeddingVector && embeddingVector.length > 0) {
                    this.statusState.stage = 'pinecone_vector_sync';
                    const patentId = `PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    await this.vectorStoreProvider.upsertVector(patentId, embeddingVector, {
                      patentId,
                      title: patentSection.title,
                      ipc: patentSection.ipcClassifications?.[0] || 'G06F',
                      country: 'US',
                      publicationDate: new Date().toISOString(),
                    });
                  }
                }

                success = true;
                this.statusState.processedCount++;
                this.log(`Successfully ingested and synchronized vector for: ${fileName}`);
              } catch (err: any) {
                this.log(`[Attempt ${attempt}/${maxRetries}] Error processing ${fileName}: ${err.message}`);
                if (attempt >= maxRetries) {
                  this.statusState.errorCount++;
                  this.log(`Failed to process ${fileName} after ${maxRetries} attempts.`);
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt - 1)));
                }
              }
            }

            // Update Progress Percentage
            this.statusState.progressPercent = Math.round(
              ((this.statusState.processedCount + this.statusState.errorCount) / rawFiles.length) * 100
            );
          }
        }

        this.statusState.status = 'completed';
        this.statusState.stage = 'idle';
        this.statusState.progressPercent = 100;
        this.statusState.lastRunDurationSeconds = (Date.now() - startTime) / 1000;
        this.log(`Pipeline finished in ${this.statusState.lastRunDurationSeconds.toFixed(2)}s. Ingested: ${this.statusState.processedCount}, Failures: ${this.statusState.errorCount}`);
      } catch (pipelineErr: any) {
        this.statusState.status = 'failed';
        this.statusState.stage = 'idle';
        this.log(`Pipeline execution encountered fatal error: ${pipelineErr.message}`);
      } finally {
        this.isRunning = false;
      }
    }, 10);

    return this.getPipelineStatus();
  }

  /**
   * Configures or toggles automated interval timer for continuous dataset synchronization.
   */
  configureSchedule(intervalMinutes: number, enabled: boolean): void {
    if (this.scheduleTimer) {
      clearInterval(this.scheduleTimer);
      this.scheduleTimer = null;
    }

    if (enabled && intervalMinutes > 0) {
      const intervalMs = intervalMinutes * 60 * 1000;
      this.statusState.nextScheduledRunTimestamp = new Date(Date.now() + intervalMs);

      this.scheduleTimer = setInterval(() => {
        this.log(`Executing scheduled automated dataset synchronization pipeline...`);
        this.triggerPipelineRun();
        this.statusState.nextScheduledRunTimestamp = new Date(Date.now() + intervalMs);
      }, intervalMs);

      this.log(`Automated ingestion pipeline scheduled every ${intervalMinutes} minutes.`);
    } else {
      this.statusState.nextScheduledRunTimestamp = undefined;
      this.log('Automated pipeline schedule disabled.');
    }
  }

  /**
   * Stops active schedule timer on service teardown.
   */
  stopSchedule(): void {
    if (this.scheduleTimer) {
      clearInterval(this.scheduleTimer);
      this.scheduleTimer = null;
    }
  }
}
