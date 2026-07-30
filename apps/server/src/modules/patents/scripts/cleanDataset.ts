import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { format as formatCsv } from 'fast-csv';

/**
 * Interface representing raw patent row read from CSV.
 */
export interface RawPatentRow {
  patnum?: string;
  pubdate?: string;
  appnum?: string;
  appdate?: string;
  ipc?: string;
  ipcver?: string;
  city?: string;
  state?: string;
  country?: string;
  owner?: string;
  claims?: string;
  title?: string;
  abstract?: string;
  gen?: string;
  file?: string;
  [key: string]: string | undefined;
}

/**
 * Interface representing cleaned patent row containing only requested 8 columns.
 */
export interface CleanedPatentRow {
  patnum: string;
  title: string;
  abstract: string;
  claims: string;
  ipc: string;
  pubdate: string;
  appnum: string;
  appdate: string;
}

/**
 * Configuration options for dataset cleaning.
 */
export interface CleaningOptions {
  inputPath: string;
  outputPath: string;
  logInterval?: number;
}

/**
 * Performance and processing statistics.
 */
export interface CleaningStats {
  totalRead: number;
  totalCleaned: number;
  skippedDuplicates: number;
  skippedMissingTitleOrAbstract: number;
  startTime: number;
  endTime: number;
  durationSeconds: number;
}

/**
 * Logger utility for clean and formatted CLI output.
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
 * Patent Dataset Cleaner Service.
 */
export class PatentDatasetCleaner {
  /**
   * Trims whitespace, removes control characters, and normalizes multiple spaces to a single space.
   */
  public static normalizeText(text: string | undefined | null): string {
    if (!text) return '';
    return text
      // Remove ASCII control characters (except tab/newline which will be normalized to space)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Replace all whitespace sequences (newlines, tabs, multiple spaces) with a single space
      .replace(/\s+/g, ' ')
      // Trim leading and trailing whitespace
      .trim();
  }

  /**
   * Sanitizes and extracts only the 8 required columns from a raw patent row.
   */
  public static sanitizeRow(rawRow: RawPatentRow): CleanedPatentRow {
    return {
      patnum: this.normalizeText(rawRow.patnum),
      title: this.normalizeText(rawRow.title),
      abstract: this.normalizeText(rawRow.abstract),
      claims: this.normalizeText(rawRow.claims),
      ipc: this.normalizeText(rawRow.ipc),
      pubdate: this.normalizeText(rawRow.pubdate),
      appnum: this.normalizeText(rawRow.appnum),
      appdate: this.normalizeText(rawRow.appdate),
    };
  }

  /**
   * Executes dataset cleaning pipeline with high-performance streaming.
   */
  public async cleanDataset(options: CleaningOptions): Promise<CleaningStats> {
    const { inputPath, outputPath, logInterval = 50000 } = options;
    const startTime = Date.now();

    Logger.info(`Starting dataset cleaning job...`);
    Logger.info(`Input file:  ${inputPath}`);
    Logger.info(`Output file: ${outputPath}`);

    // Validation: Verify input file existence
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file does not exist at path: ${inputPath}`);
    }

    // Ensure target output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      Logger.info(`Creating output directory: ${outputDir}`);
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Statistics tracking
    let totalRead = 0;
    let totalCleaned = 0;
    let skippedDuplicates = 0;
    let skippedMissingTitleOrAbstract = 0;

    // In-memory set for deduplication by patent number / app number
    const seenPatents = new Set<string>();

    const readStream = fs.createReadStream(inputPath);
    const writeStream = fs.createWriteStream(outputPath);

    // Explicitly set output headers to preserve only the 8 required columns in exact order
    const csvTransformStream = formatCsv({
      headers: ['patnum', 'title', 'abstract', 'claims', 'ipc', 'pubdate', 'appnum', 'appdate'],
    });
    csvTransformStream.pipe(writeStream);

    const parser = readStream.pipe(csvParser());

    try {
      for await (const rawRow of parser) {
        totalRead++;

        // Step 1: Clean and extract only required 8 fields
        const cleanedRow = PatentDatasetCleaner.sanitizeRow(rawRow as RawPatentRow);

        // Step 2: Remove rows missing title or abstract
        if (!cleanedRow.title || !cleanedRow.abstract) {
          skippedMissingTitleOrAbstract++;
          continue;
        }

        // Step 3: Remove duplicate patents (Deduplicate by patnum, falling back to appnum)
        const patentIdKey =
          cleanedRow.patnum ||
          cleanedRow.appnum ||
          `${cleanedRow.title.substring(0, 30)}_${cleanedRow.abstract.substring(0, 30)}`;

        if (seenPatents.has(patentIdKey)) {
          skippedDuplicates++;
          continue;
        }
        seenPatents.add(patentIdKey);

        // Step 4: Write cleaned row to write stream
        const canContinue = csvTransformStream.write(cleanedRow);
        totalCleaned++;

        // Handle stream backpressure if buffer is full
        if (!canContinue) {
          await new Promise<void>((resolve) => csvTransformStream.once('drain', resolve));
        }

        // Periodic Logging
        if (totalRead % logInterval === 0) {
          const memoryUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
          const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
          Logger.info(
            `Processed ${totalRead.toLocaleString()} rows | ` +
              `Cleaned: ${totalCleaned.toLocaleString()} | ` +
              `Duplicates skipped: ${skippedDuplicates.toLocaleString()} | ` +
              `Missing data skipped: ${skippedMissingTitleOrAbstract.toLocaleString()} | ` +
              `Heap: ${memoryUsageMB} MB | ` +
              `Elapsed: ${elapsedSec}s`
          );
        }
      }

      // End CSV transform stream cleanly
      csvTransformStream.end();

      // Wait for output write stream to finish flushes
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      const endTime = Date.now();
      const durationSeconds = (endTime - startTime) / 1000;

      const stats: CleaningStats = {
        totalRead,
        totalCleaned,
        skippedDuplicates,
        skippedMissingTitleOrAbstract,
        startTime,
        endTime,
        durationSeconds,
      };

      this.printSummaryReport(stats);
      return stats;
    } catch (error) {
      Logger.error(`Failed to process dataset CSV stream:`, error);
      // Clean up incomplete output file if error occurs
      if (fs.existsSync(outputPath)) {
        try {
          fs.unlinkSync(outputPath);
          Logger.info(`Cleaned up partial output file at ${outputPath}`);
        } catch (unlinkError) {
          Logger.error(`Failed to delete partial output file:`, unlinkError);
        }
      }
      throw error;
    }
  }

  /**
   * Prints detailed summary report upon script completion.
   */
  private printSummaryReport(stats: CleaningStats): void {
    console.log('\n==================================================');
    console.log('            DATASET CLEANING COMPLETE             ');
    console.log('==================================================');
    console.log(`Total Rows Read:              ${stats.totalRead.toLocaleString()}`);
    console.log(`Cleaned Rows Output:         ${stats.totalCleaned.toLocaleString()}`);
    console.log(`Duplicates Removed:           ${stats.skippedDuplicates.toLocaleString()}`);
    console.log(`Missing Title/Abstract:       ${stats.skippedMissingTitleOrAbstract.toLocaleString()}`);
    console.log(`Total Processing Time:        ${stats.durationSeconds.toFixed(2)} seconds`);
    if (stats.durationSeconds > 0) {
      const throughput = Math.round(stats.totalRead / stats.durationSeconds);
      console.log(`Average Processing Speed:     ${throughput.toLocaleString()} rows/sec`);
    }
    console.log('==================================================\n');
  }
}

/**
 * Main execution entry point.
 */
async function main(): Promise<void> {
  const projectRoot = process.cwd();

  // Default paths relative to apps/server or project root
  const defaultInputPath =
    path.isAbsolute(projectRoot) && projectRoot.endsWith('server')
      ? path.resolve(projectRoot, 'src/modules/patents/dataset/raw/grant_grant.csv')
      : path.resolve(projectRoot, 'apps/server/src/modules/patents/dataset/raw/grant_grant.csv');

  const defaultOutputPath =
    path.isAbsolute(projectRoot) && projectRoot.endsWith('server')
      ? path.resolve(projectRoot, 'src/modules/patents/dataset/clean/grant_grant_clean.csv')
      : path.resolve(projectRoot, 'apps/server/src/modules/patents/dataset/clean/grant_grant_clean.csv');

  // Allow custom CLI arguments if provided: --input <path> --output <path>
  const args = process.argv.slice(2);
  let inputPath = defaultInputPath;
  let outputPath = defaultOutputPath;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    if (arg === '--input' && nextArg) {
      inputPath = path.resolve(nextArg);
      i++;
    } else if (arg === '--output' && nextArg) {
      outputPath = path.resolve(nextArg);
      i++;
    }
  }

  const cleaner = new PatentDatasetCleaner();

  try {
    await cleaner.cleanDataset({
      inputPath,
      outputPath,
      logInterval: 50000,
    });
    Logger.success(`Successfully saved cleaned dataset into: ${outputPath}`);
  } catch (error) {
    Logger.error('Dataset cleaning failed with error.', error);
    process.exit(1);
  }
}

// Execute script if run directly
const scriptPath = process.argv[1];
if (scriptPath && (import.meta.url === `file://${scriptPath}` || scriptPath.endsWith('cleanDataset.ts'))) {
  main();
}
