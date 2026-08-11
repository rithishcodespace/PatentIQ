import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { Pinecone, type PineconeRecord } from '@pinecone-database/pinecone';
import { env } from '../../../config/env.config.js';

/**
 * Interface representing vector section metadata stored in Pinecone.
 */
export interface PatentVectorMetadata {
  patentId: string;
  publicationNumber?: string;
  sectionType?: 'title' | 'abstract' | 'claim' | 'claims' | 'description' | string;
  section?: 'title' | 'abstract' | 'claims' | 'description' | string;
  chunkId?: string;
  claimNumber?: number;
  ipc?: string;
  cpc?: string;
  title?: string;
  abstract?: string;
  claims?: string;
  description?: string;
  inventors?: string;
  owner?: string;
  applicants?: string;
  publicationDate?: string;
  filingDate?: string;
  priorityDate?: string;
  sourceUrl?: string;
  [key: string]: any;
}

/**
 * Input format read from patent_embeddings.json.
 */
export interface PatentEmbeddingRecord {
  patentId: string;
  publicationNumber?: string;
  ipc?: string;
  cpc?: string;
  title?: string;
  abstract?: string;
  claims?: string;
  description?: string;
  inventors?: string;
  owner?: string;
  applicants?: string;
  publicationDate?: string;
  filingDate?: string;
  priorityDate?: string;
  sourceUrl?: string;
  embeddings?: {
    title?: number[];
    abstract?: number[];
    claims?: number[];
    description?: number[];
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
 * Formatted console logger.
 */
class Logger {
  private static formatTime(): string {
    return new Date().toISOString();
  }

  static info(message: string): void {
    console.log(`[${this.formatTime()}] [INFO]  ${message}`);
  }

  static success(message: string): void {
    console.log(`[${this.formatTime()}] [OK]    ${message}`);
  }

  static warn(message: string): void {
    console.warn(`[${this.formatTime()}] [WARN]  ${message}`);
  }

  static error(message: string, error?: unknown): void {
    console.error(`[${this.formatTime()}] [ERROR] ${message}`);
    if (error) {
      console.error(error);
    }
  }
}

/**
 * Pinecone Vector Uploader Service.
 */
export class PineconePatentUploader {
  private pineconeClient?: Pinecone;
  private indexName: string;
  private maxRetries: number;
  private isDryRun: boolean;

  constructor(apiKey?: string, indexName?: string, maxRetries = 3, dryRun = false) {
    const finalApiKey = apiKey || env.PINECONE_API_KEY || process.env.PINECONE_API_KEY;
    this.indexName = indexName || env.PINECONE_INDEX_NAME || process.env.PINECONE_INDEX_NAME || 'patent-embeddings';
    this.maxRetries = maxRetries;
    this.isDryRun = dryRun;

    if (!finalApiKey && !dryRun) {
      Logger.warn(`PINECONE_API_KEY is not set. Switching to Dry-Run Mode.`);
      this.isDryRun = true;
    }

    if (finalApiKey && !this.isDryRun) {
      this.pineconeClient = new Pinecone({ apiKey: finalApiKey });
    }
  }

  /**
   * Retries async operations with exponential backoff.
   */
  private async retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt === this.maxRetries) break;
        const delayMs = 500 * Math.pow(2, attempt - 1);
        Logger.warn(`Pinecone upload attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw lastError;
  }

  /**
   * Upserts a batch of vector records to Pinecone index.
   */
  private async uploadBatch(batch: PineconeRecord<PatentVectorMetadata>[]): Promise<boolean> {
    if (batch.length === 0) return true;

    if (this.isDryRun) {
      // Simulate successful upload in dry run mode
      return true;
    }

    if (!this.pineconeClient) {
      throw new Error(`Pinecone client is not initialized.`);
    }

    try {
      const index = this.pineconeClient.index<PatentVectorMetadata>(this.indexName);
      await this.retryWithBackoff(async () => {
        await index.upsert({ records: batch });
      });
      return true;
    } catch (err) {
      Logger.error(`Failed to upload batch of ${batch.length} vectors after retries`, err);
      return false;
    }
  }

  /**
   * Reads section embeddings from input file and uploads vector records to Pinecone in batches.
   */
  public async uploadEmbeddings(options: UploadOptions): Promise<UploadStats> {
    const { inputPath, batchSize = 100 } = options;
    const startTime = Date.now();

    Logger.info(`Starting Pinecone vector upload process...`);
    Logger.info(`Input file:  ${inputPath}`);
    Logger.info(`Index name:  ${this.indexName}`);
    Logger.info(`Batch size:  ${batchSize} vectors`);
    Logger.info(`Mode:        ${this.isDryRun ? 'DRY-RUN (Simulation)' : 'LIVE (Pinecone API)'}`);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input patent embeddings JSON file not found at: ${inputPath}`);
    }

    let totalVectorsProcessed = 0;
    let totalVectorsUploaded = 0;
    let failedUploads = 0;

    let vectorBatchBuffer: PineconeRecord<PatentVectorMetadata>[] = [];

    const fileStream = fs.createReadStream(inputPath, { encoding: 'utf-8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    try {
      for await (const line of rl) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === '[' || trimmed === ']' || trimmed === '],') {
          continue;
        }

        const jsonStr = trimmed.endsWith(',') ? trimmed.slice(0, -1) : trimmed;

        let record: PatentEmbeddingRecord;
        try {
          record = JSON.parse(jsonStr);
        } catch {
          continue;
        }

        const patentId = record.patentId || '';
        const ipc = record.ipc || '';

        // Extract vectors for each section: title, abstract, claims
        const titleVec = record.embeddings?.title;
        const abstractVec = record.embeddings?.abstract;
        const claimsVec = record.embeddings?.claims;

        const sections: Array<{ name: 'title' | 'abstract' | 'claims'; vector: number[] }> = [];
        if (titleVec && titleVec.length > 0) sections.push({ name: 'title', vector: titleVec });
        if (abstractVec && abstractVec.length > 0) sections.push({ name: 'abstract', vector: abstractVec });
        if (claimsVec && claimsVec.length > 0) sections.push({ name: 'claims', vector: claimsVec });

        for (const sec of sections) {
          // Skip empty or missing embeddings safely
          if (!sec.vector || !Array.isArray(sec.vector) || sec.vector.length === 0) {
            continue;
          }

          totalVectorsProcessed++;

          const vectorRecord: PineconeRecord<PatentVectorMetadata> = {
            id: `${patentId}_${sec.name}`,
            values: sec.vector,
            metadata: {
              patentId,
              section: sec.name,
              ipc,
            },
          };

          vectorBatchBuffer.push(vectorRecord);

          // Flush batch buffer when batch size is reached
          if (vectorBatchBuffer.length >= batchSize) {
            const success = await this.uploadBatch(vectorBatchBuffer);
            if (success) {
              totalVectorsUploaded += vectorBatchBuffer.length;
            } else {
              failedUploads += vectorBatchBuffer.length;
            }

            vectorBatchBuffer = [];

            if (totalVectorsProcessed % (batchSize * 5) === 0 || totalVectorsProcessed % 500 === 0) {
              const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
              Logger.info(
                `Processed ${totalVectorsProcessed.toLocaleString()} vectors | ` +
                `Uploaded: ${totalVectorsUploaded.toLocaleString()} | ` +
                `Failed: ${failedUploads.toLocaleString()} | ` +
                `Elapsed: ${elapsedSec}s`
              );
            }
          }
        }
      }

      // Flush remaining vector records in batch buffer
      if (vectorBatchBuffer.length > 0) {
        const success = await this.uploadBatch(vectorBatchBuffer);
        if (success) {
          totalVectorsUploaded += vectorBatchBuffer.length;
        } else {
          failedUploads += vectorBatchBuffer.length;
        }
        vectorBatchBuffer = [];
      }

      const endTime = Date.now();
      const durationSeconds = (endTime - startTime) / 1000;
      const averageSpeedVectorsPerSec =
        durationSeconds > 0 ? Math.round(totalVectorsUploaded / durationSeconds) : 0;

      const stats: UploadStats = {
        totalVectorsProcessed,
        totalVectorsUploaded,
        failedUploads,
        durationSeconds,
        averageSpeedVectorsPerSec,
        startTime,
        endTime,
      };

      this.printSummaryReport(stats);
      return stats;

    } catch (error) {
      Logger.error(`Pinecone vector upload process failed:`, error);
      throw error;
    }
  }

  /**
   * Prints final summary report upon upload completion.
   */
  private printSummaryReport(stats: UploadStats): void {
    console.log('\n==================================================');
    console.log('         PINECONE VECTOR UPLOAD COMPLETE          ');
    console.log('==================================================');
    console.log(`Total Vectors Processed:     ${stats.totalVectorsProcessed.toLocaleString()}`);
    console.log(`Total Vectors Uploaded:      ${stats.totalVectorsUploaded.toLocaleString()}`);
    console.log(`Failed Vector Uploads:       ${stats.failedUploads.toLocaleString()}`);
    console.log(`Upload Duration:             ${stats.durationSeconds.toFixed(2)} seconds`);
    console.log(`Average Upload Speed:        ${stats.averageSpeedVectorsPerSec.toLocaleString()} vectors/sec`);
    console.log('==================================================\n');
  }
}

/**
 * CLI Main execution entry point.
 */
async function main(): Promise<void> {
  const currentFilePath = fileURLToPath(import.meta.url);
  const scriptsDir = path.dirname(currentFilePath);
  const patentsModuleDir = path.resolve(scriptsDir, '..');

  const defaultInputPath = path.resolve(patentsModuleDir, 'dataset/processed/patent_embeddings.json');

  const args = process.argv.slice(2);
  let inputPath = defaultInputPath;
  let batchSize = 100;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    if (arg === '--input' && nextArg) {
      inputPath = path.resolve(nextArg);
      i++;
    } else if (arg === '--batch-size' && nextArg) {
      batchSize = parseInt(nextArg, 10) || 100;
      i++;
    } else if (arg === '--dry-run') {
      dryRun = true;
    }
  }

  const apiKey = process.env.PINECONE_API_KEY || env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME || env.PINECONE_INDEX_NAME || 'patent-embeddings';

  const uploader = new PineconePatentUploader(apiKey, indexName, 3, dryRun);

  try {
    await uploader.uploadEmbeddings({
      inputPath,
      batchSize,
    });
    Logger.success(`Pinecone vector upload pipeline finished successfully.`);
  } catch (error) {
    Logger.error('Pinecone vector upload pipeline terminated with error.', error);
    process.exit(1);
  }
}

// Execute script if run directly
const scriptPath = process.argv[1];
if (scriptPath && (import.meta.url === `file://${scriptPath}` || scriptPath.endsWith('uploadToPinecone.ts'))) {
  main();
}
