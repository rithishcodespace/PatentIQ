import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { PatentParserService } from '../services/patent-parser.service.js';
import { OllamaEmbeddingProvider } from '../../../providers/embedding/ollama-embedding.provider.js';
class Logger {
    static formatTime() {
        return new Date().toISOString();
    }
    static info(msg) {
        console.log(`[${this.formatTime()}] [INFO]  ${msg}`);
    }
    static success(msg) {
        console.log(`[${this.formatTime()}] [OK]    ${msg}`);
    }
    static warn(msg) {
        console.warn(`[${this.formatTime()}] [WARN]  ${msg}`);
    }
    static error(msg, err) {
        console.error(`[${this.formatTime()}] [ERROR] ${msg}`);
        if (err)
            console.error(err);
    }
}
export async function runPatentIngestionScript(options = {}) {
    const startTime = Date.now();
    const currentFilePath = fileURLToPath(import.meta.url);
    const scriptsDir = path.dirname(currentFilePath);
    const patentsModuleDir = path.resolve(scriptsDir, '..');
    const rawDir = options.rawDir || path.resolve(patentsModuleDir, 'dataset/raw');
    const maxFiles = options.maxFiles || 50;
    const generateEmbeddings = options.generateEmbeddings !== false;
    const ollamaBaseUrl = options.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const prisma = options.prisma || new PrismaClient();
    const parserService = new PatentParserService();
    const embeddingProvider = new OllamaEmbeddingProvider(ollamaBaseUrl, 'nomic-embed-text');
    Logger.info(`Starting batch patent ingestion pipeline...`);
    Logger.info(`Raw Directory: ${rawDir}`);
    Logger.info(`Embeddings Enabled: ${generateEmbeddings}`);
    if (!fs.existsSync(rawDir)) {
        Logger.warn(`Raw dataset directory does not exist at ${rawDir}. Creating directory...`);
        fs.mkdirSync(rawDir, { recursive: true });
    }
    let totalFilesProcessed = 0;
    let totalPatentsIngested = 0;
    let totalEmbeddingsGenerated = 0;
    const entries = fs.readdirSync(rawDir, { withFileTypes: true });
    const rawFiles = entries
        .filter((e) => e.isFile() && !e.name.startsWith('.'))
        .map((e) => path.join(rawDir, e.name))
        .slice(0, maxFiles);
    Logger.info(`Found ${rawFiles.length} raw files to process.`);
    for (const filePath of rawFiles) {
        try {
            const fileName = path.basename(filePath);
            const ext = path.extname(filePath).toLowerCase();
            const stats = fs.statSync(filePath);
            Logger.info(`Processing file [${totalFilesProcessed + 1}/${rawFiles.length}]: ${fileName} (${(stats.size / 1024).toFixed(1)} KB)`);
            let patentSection;
            let mimeType = 'text/plain';
            if (ext === '.pdf') {
                mimeType = 'application/pdf';
                const buffer = fs.readFileSync(filePath);
                patentSection = await parserService.parsePdf(buffer);
            }
            else if (ext === '.docx') {
                mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                const buffer = fs.readFileSync(filePath);
                patentSection = await parserService.parseDocx(buffer);
            }
            else {
                const textContent = fs.readFileSync(filePath, 'utf-8');
                patentSection = await parserService.parseCsvOrText(textContent);
            }
            // Store Document Metadata in PostgreSQL via Prisma
            const storedDoc = await prisma.uploadedDocument.create({
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
            totalPatentsIngested++;
            Logger.success(`Ingested record into PostgreSQL (ID: ${storedDoc.id}) | Title: "${patentSection.title.slice(0, 50)}..."`);
            // Queue/Generate vector embeddings if enabled
            if (generateEmbeddings && patentSection.abstract) {
                try {
                    const textToEmbed = `${patentSection.title}. ${patentSection.abstract}`;
                    const embeddingVector = await embeddingProvider.generateEmbedding(textToEmbed);
                    if (embeddingVector && embeddingVector.length > 0) {
                        totalEmbeddingsGenerated++;
                        Logger.info(`Generated vector embedding (${embeddingVector.length} dims) for "${fileName}"`);
                    }
                }
                catch (embedErr) {
                    Logger.warn(`Vector embedding generation skipped for ${fileName}: ${embedErr.message}`);
                }
            }
            totalFilesProcessed++;
        }
        catch (fileErr) {
            Logger.error(`Failed to ingest file ${path.basename(filePath)}:`, fileErr);
        }
    }
    const durationSeconds = (Date.now() - startTime) / 1000;
    Logger.info(`==================================================`);
    Logger.info(`       BATCH PATENT INGESTION COMPLETE            `);
    Logger.info(`==================================================`);
    Logger.info(`Total Files Processed:       ${totalFilesProcessed}`);
    Logger.info(`Total Records Ingested:      ${totalPatentsIngested}`);
    Logger.info(`Embeddings Generated:        ${totalEmbeddingsGenerated}`);
    Logger.info(`Duration:                    ${durationSeconds.toFixed(2)} seconds`);
    Logger.info(`==================================================`);
    return {
        totalFilesProcessed,
        totalPatentsIngested,
        totalEmbeddingsGenerated,
        durationSeconds,
    };
}
// Execute script if run directly
const scriptPath = process.argv[1];
if (scriptPath && (import.meta.url === `file://${scriptPath}` || scriptPath.endsWith('patent-ingestion.script.ts'))) {
    runPatentIngestionScript().catch((err) => {
        console.error('Ingestion script execution failed:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=patent-ingestion.script.js.map