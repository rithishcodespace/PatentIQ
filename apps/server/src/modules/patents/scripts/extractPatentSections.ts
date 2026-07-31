import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csvParser from 'csv-parser';

/**
 * Raw patent record read from cleaned CSV file.
 */
export interface CleanedCSVRow {
  patnum?: string;
  title?: string;
  abstract?: string;
  claims?: string;
  ipc?: string;
  ipcver?: string;
  pubdate?: string;
  appnum?: string;
  appdate?: string;
  [key: string]: string | undefined;
}

/**
 * Standardized structured patent section entity.
 */
export interface ExtractedPatentSection {
  patentId: string;
  title: string;
  abstract: string;
  claims: string;
  ipc: string;
  ipcVersion: string;
  publicationDate: string;
  applicationNumber: string;
  applicationDate: string;
}

/**
 * Options for the section extraction process.
 */
export interface ExtractionOptions {
  inputPath: string;
  outputPath: string;
  logInterval?: number;
}

/**
 * Performance and extraction statistics.
 */
export interface ExtractionStats {
  totalProcessed: number;
  durationSeconds: number;
  averageSpeedRowsPerSec: number;
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

  static error(message: string, error?: unknown): void {
    console.error(`[${this.formatTime()}] [ERROR] ${message}`);
    if (error) {
      console.error(error);
    }
  }
}

/**
 * Patent Section Extractor Service.
 */
export class PatentSectionExtractor {
  /**
   * Normalizes text by trimming whitespace, stripping ASCII control characters,
   * and collapsing multiple space sequences into a single space.
   */
  public static normalizeText(text: string | undefined | null): string {
    if (!text) return '';
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Transforms raw CSV row into structured JSON Patent Section object.
   */
  public static extractSections(row: CleanedCSVRow): ExtractedPatentSection {
    return {
      patentId: this.normalizeText(row.patnum),
      title: this.normalizeText(row.title),
      abstract: this.normalizeText(row.abstract),
      claims: this.normalizeText(row.claims),
      ipc: this.normalizeText(row.ipc),
      ipcVersion: this.normalizeText(row.ipcver),
      publicationDate: this.normalizeText(row.pubdate),
      applicationNumber: this.normalizeText(row.appnum),
      applicationDate: this.normalizeText(row.appdate),
    };
  }

  /**
   * Reads cleaned CSV dataset via stream and writes structured JSON array stream.
   */
  public async extractDatasetSections(options: ExtractionOptions): Promise<ExtractionStats> {
    const { inputPath, outputPath, logInterval = 50000 } = options;
    const startTime = Date.now();

    Logger.info(`Starting patent section extraction job...`);
    Logger.info(`Input file:  ${inputPath}`);
    Logger.info(`Output file: ${outputPath}`);

    // Verify input file existence
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input CSV dataset not found at: ${inputPath}`);
    }

    // Automatically create target processed directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      Logger.info(`Creating directory: ${outputDir}`);
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let totalProcessed = 0;

    const readStream = fs.createReadStream(inputPath);
    const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf-8' });
    const parser = readStream.pipe(csvParser());

    // Start JSON array stream
    const canContinueInit = writeStream.write('[\n');
    if (!canContinueInit) {
      await new Promise<void>((resolve) => writeStream.once('drain', resolve));
    }

    let isFirstRecord = true;

    try {
      for await (const rawRow of parser) {
        totalProcessed++;

        const extractedPatent = PatentSectionExtractor.extractSections(rawRow as CleanedCSVRow);

        const recordJson = (isFirstRecord ? '  ' : ',\n  ') + JSON.stringify(extractedPatent);
        isFirstRecord = false;

        const canContinue = writeStream.write(recordJson);
        if (!canContinue) {
          await new Promise<void>((resolve) => writeStream.once('drain', resolve));
        }

        // Periodic Progress Logging
        if (totalProcessed % logInterval === 0) {
          const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
          const heapMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
          Logger.info(
            `Extracted ${totalProcessed.toLocaleString()} patents | ` +
            `Heap: ${heapMB} MB | ` +
            `Elapsed: ${elapsedSec}s`
          );
        }
      }

      // Close JSON array stream
      const canContinueClose = writeStream.write('\n]\n');
      if (!canContinueClose) {
        await new Promise<void>((resolve) => writeStream.once('drain', resolve));
      }

      writeStream.end();

      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      const endTime = Date.now();
      const durationSeconds = (endTime - startTime) / 1000;
      const averageSpeedRowsPerSec = durationSeconds > 0 ? Math.round(totalProcessed / durationSeconds) : 0;

      const stats: ExtractionStats = {
        totalProcessed,
        durationSeconds,
        averageSpeedRowsPerSec,
        startTime,
        endTime,
      };

      this.printSummaryReport(stats);
      return stats;

    } catch (error) {
      Logger.error(`Extraction failed:`, error);
      if (fs.existsSync(outputPath)) {
        try {
          fs.unlinkSync(outputPath);
          Logger.info(`Cleaned up partial output file: ${outputPath}`);
        } catch (unlinkErr) {
          Logger.error(`Failed to delete partial file:`, unlinkErr);
        }
      }
      throw error;
    }
  }

  /**
   * Prints final summary report upon extraction completion.
   */
  private printSummaryReport(stats: ExtractionStats): void {
    console.log('\n==================================================');
    console.log('         PATENT SECTION EXTRACTION COMPLETE       ');
    console.log('==================================================');
    console.log(`Total Patents Processed:     ${stats.totalProcessed.toLocaleString()}`);
    console.log(`Processing Time:             ${stats.durationSeconds.toFixed(2)} seconds`);
    console.log(`Average Processing Speed:    ${stats.averageSpeedRowsPerSec.toLocaleString()} rows/sec`);
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

  const defaultInputPath = path.resolve(patentsModuleDir, 'dataset/clean/grant_grant_clean.csv');
  const defaultOutputPath = path.resolve(patentsModuleDir, 'dataset/processed/patents.json');

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

  const extractor = new PatentSectionExtractor();

  try {
    await extractor.extractDatasetSections({
      inputPath,
      outputPath,
      logInterval: 50000,
    });
    Logger.success(`Successfully saved extracted JSON dataset into: ${outputPath}`);
  } catch (error) {
    Logger.error('Section extraction process terminated with errors.', error);
    process.exit(1);
  }
}

// Execute script if run directly
const scriptPath = process.argv[1];
if (scriptPath && (import.meta.url === `file://${scriptPath}` || scriptPath.endsWith('extractPatentSections.ts'))) {
  main();
}
