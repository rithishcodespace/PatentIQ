import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { OllamaEmbeddingProvider } from '../../../providers/embedding/ollama-embedding.provider.js';
/**
 * Logger utility for clean and formatted CLI output.
 */
class Logger {
    static formatTime() {
        return new Date().toISOString();
    }
    static info(message) {
        console.log(`[${this.formatTime()}] [INFO]  ${message}`);
    }
    static success(message) {
        console.log(`[${this.formatTime()}] [OK]    ${message}`);
    }
    static warn(message) {
        console.warn(`[${this.formatTime()}] [WARN]  ${message}`);
    }
    static error(message, error) {
        console.error(`[${this.formatTime()}] [ERROR] ${message}`);
        if (error) {
            console.error(error);
        }
    }
}
/**
 * Patent Section Embedding Generator reusing standard OllamaEmbeddingProvider.
 */
export class PatentEmbeddingGenerator {
    embeddingProvider;
    modelName;
    constructor(baseUrl = 'http://localhost:11434', modelName = 'nomic-embed-text', maxRetries = 3, provider) {
        this.modelName = modelName;
        this.embeddingProvider = provider || new OllamaEmbeddingProvider(baseUrl, modelName, maxRetries);
    }
    /**
     * Generates section-wise embeddings (title, abstract, claims) for a batch of patent records
     * by delegating batch embedding generation to OllamaEmbeddingProvider.
     */
    async processPatentBatch(patents) {
        const titles = patents.map((p) => p.title || '');
        const abstracts = patents.map((p) => p.abstract || '');
        const claims = patents.map((p) => p.claims || '');
        // Delegate batch embedding generation to shared OllamaEmbeddingProvider
        const titleEmbeddings = await this.embeddingProvider.generateBatchEmbeddings(titles);
        const abstractEmbeddings = await this.embeddingProvider.generateBatchEmbeddings(abstracts);
        const claimsEmbeddings = await this.embeddingProvider.generateBatchEmbeddings(claims);
        return patents.map((patent, index) => ({
            patentId: patent.patentId || '',
            ipc: patent.ipc || '',
            embeddings: {
                title: titleEmbeddings[index] || [],
                abstract: abstractEmbeddings[index] || [],
                claims: claimsEmbeddings[index] || [],
            },
        }));
    }
    /**
     * Executes embedding generation pipeline over input patents JSON file.
     */
    async generateEmbeddings(options) {
        const { inputPath, outputPath, batchSize = 32, logInterval = 32, } = options;
        const startTime = Date.now();
        Logger.info(`Starting patent section embedding generation...`);
        Logger.info(`Input JSON:   ${inputPath}`);
        Logger.info(`Output JSON:  ${outputPath}`);
        Logger.info(`Model:        ${this.modelName}`);
        Logger.info(`Batch Size:   ${batchSize}`);
        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input patents JSON not found at path: ${inputPath}`);
        }
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            Logger.info(`Creating output directory: ${outputDir}`);
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf-8' });
        // Write opening array bracket
        const canContinueInit = writeStream.write('[\n');
        if (!canContinueInit) {
            await new Promise((resolve) => writeStream.once('drain', resolve));
        }
        let totalProcessed = 0;
        let isFirstRecord = true;
        let currentBatch = [];
        // Stream read patents JSON line by line
        const fileStream = fs.createReadStream(inputPath, { encoding: 'utf-8' });
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });
        try {
            for await (const line of rl) {
                const trimmed = line.trim();
                // Skip empty lines or JSON array brackets
                if (!trimmed || trimmed === '[' || trimmed === ']' || trimmed === '],') {
                    continue;
                }
                // Clean trailing comma if present
                const jsonStr = trimmed.endsWith(',') ? trimmed.slice(0, -1) : trimmed;
                try {
                    const patentRecord = JSON.parse(jsonStr);
                    currentBatch.push(patentRecord);
                }
                catch {
                    // Skip unparseable lines gracefully
                    continue;
                }
                if (currentBatch.length >= batchSize) {
                    const processedOutputs = await this.processPatentBatch(currentBatch);
                    totalProcessed += processedOutputs.length;
                    for (const outputObj of processedOutputs) {
                        const outputJson = (isFirstRecord ? '  ' : ',\n  ') + JSON.stringify(outputObj);
                        isFirstRecord = false;
                        const canContinue = writeStream.write(outputJson);
                        if (!canContinue) {
                            await new Promise((resolve) => writeStream.once('drain', resolve));
                        }
                    }
                    currentBatch = [];
                    if (totalProcessed % logInterval === 0 || totalProcessed % (batchSize * 5) === 0) {
                        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
                        const heapMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
                        Logger.info(`Embedded ${totalProcessed.toLocaleString()} patents | ` +
                            `Heap: ${heapMB} MB | ` +
                            `Elapsed: ${elapsedSec}s`);
                    }
                }
            }
            // Process remaining patents in buffer
            if (currentBatch.length > 0) {
                const processedOutputs = await this.processPatentBatch(currentBatch);
                totalProcessed += processedOutputs.length;
                for (const outputObj of processedOutputs) {
                    const outputJson = (isFirstRecord ? '  ' : ',\n  ') + JSON.stringify(outputObj);
                    isFirstRecord = false;
                    const canContinue = writeStream.write(outputJson);
                    if (!canContinue) {
                        await new Promise((resolve) => writeStream.once('drain', resolve));
                    }
                }
                currentBatch = [];
            }
            // Write closing bracket
            const canContinueClose = writeStream.write('\n]\n');
            if (!canContinueClose) {
                await new Promise((resolve) => writeStream.once('drain', resolve));
            }
            writeStream.end();
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });
            const endTime = Date.now();
            const durationSeconds = (endTime - startTime) / 1000;
            const avgTimePerPatentMs = totalProcessed > 0 ? (durationSeconds * 1000) / totalProcessed : 0;
            const throughputPatentsPerSec = durationSeconds > 0 ? totalProcessed / durationSeconds : 0;
            const stats = {
                totalProcessed,
                durationSeconds,
                avgTimePerPatentMs,
                throughputPatentsPerSec,
                startTime,
                endTime,
            };
            this.printSummaryReport(stats);
            return stats;
        }
        catch (error) {
            Logger.error(`Embedding generation failed:`, error);
            if (fs.existsSync(outputPath)) {
                try {
                    fs.unlinkSync(outputPath);
                    Logger.info(`Cleaned up partial output file: ${outputPath}`);
                }
                catch (unlinkErr) {
                    Logger.error(`Failed to delete partial file:`, unlinkErr);
                }
            }
            throw error;
        }
    }
    /**
     * Prints final summary report upon embedding completion.
     */
    printSummaryReport(stats) {
        console.log('\n==================================================');
        console.log('       PATENT EMBEDDING GENERATION COMPLETE       ');
        console.log('==================================================');
        console.log(`Total Patents Processed:     ${stats.totalProcessed.toLocaleString()}`);
        console.log(`Embedding Time:              ${stats.durationSeconds.toFixed(2)} seconds`);
        console.log(`Average Time per Patent:     ${stats.avgTimePerPatentMs.toFixed(2)} ms/patent`);
        console.log(`Throughput:                  ${stats.throughputPatentsPerSec.toFixed(2)} patents/sec`);
        console.log('==================================================\n');
    }
}
/**
 * CLI Main entry point.
 */
async function main() {
    const currentFilePath = fileURLToPath(import.meta.url);
    const scriptsDir = path.dirname(currentFilePath);
    const patentsModuleDir = path.resolve(scriptsDir, '..');
    const defaultInputPath = path.resolve(patentsModuleDir, 'dataset/processed/patents.json');
    const defaultOutputPath = path.resolve(patentsModuleDir, 'dataset/processed/patent_embeddings.json');
    const args = process.argv.slice(2);
    let inputPath = defaultInputPath;
    let outputPath = defaultOutputPath;
    let batchSize = 32;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];
        if (arg === '--input' && nextArg) {
            inputPath = path.resolve(nextArg);
            i++;
        }
        else if (arg === '--output' && nextArg) {
            outputPath = path.resolve(nextArg);
            i++;
        }
        else if (arg === '--batch-size' && nextArg) {
            batchSize = parseInt(nextArg, 10) || 32;
            i++;
        }
    }
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const modelName = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
    const generator = new PatentEmbeddingGenerator(baseUrl, modelName, 3);
    try {
        await generator.generateEmbeddings({
            inputPath,
            outputPath,
            batchSize,
        });
        Logger.success(`Successfully saved section embeddings to: ${outputPath}`);
    }
    catch (error) {
        Logger.error('Embedding generation process failed.', error);
        process.exit(1);
    }
}
// Execute script if run directly
const scriptPath = process.argv[1];
if (scriptPath && (import.meta.url === `file://${scriptPath}` || scriptPath.endsWith('generateEmbeddings.ts'))) {
    main();
}
//# sourceMappingURL=generateEmbeddings.js.map