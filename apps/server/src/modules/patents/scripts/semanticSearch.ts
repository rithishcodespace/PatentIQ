import { Ollama } from 'ollama';
import { Pinecone, type RecordMetadata } from '@pinecone-database/pinecone';
import { env } from '../../../config/env.config.js';

/**
 * Interface representing vector section metadata stored in Pinecone.
 */
export interface PatentVectorMetadata extends RecordMetadata {
  patentId: string;
  section: 'title' | 'abstract' | 'claims';
  ipc: string;
}

/**
 * Interface representing a ranked semantic search result item.
 */
export interface SearchResultItem {
  rank: number;
  patentId: string;
  section: 'title' | 'abstract' | 'claims' | string;
  score: number;
  ipc: string;
  vectorId: string;
}

/**
 * Execution metrics for latency breakdown.
 */
export interface SearchMetrics {
  queryEmbeddingTimeMs: number;
  pineconeSearchTimeMs: number;
  totalExecutionTimeMs: number;
  totalResults: number;
}

/**
 * Logger utility for clean CLI feedback.
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
 * Patent Semantic Search Service.
 */
export class PatentSemanticSearcher {
  private ollama: Ollama;
  private pineconeClient?: Pinecone;
  private embeddingModel: string;
  private indexName: string;
  private maxRetries: number;
  private isMockMode: boolean;

  constructor(
    ollamaBaseUrl?: string,
    embeddingModel?: string,
    pineconeApiKey?: string,
    pineconeIndexName?: string,
    maxRetries = 3,
    mockMode = false
  ) {
    const baseUrl = ollamaBaseUrl || env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.embeddingModel = embeddingModel || env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
    this.maxRetries = maxRetries;
    this.isMockMode = mockMode;

    const apiKey = pineconeApiKey || env.PINECONE_API_KEY || process.env.PINECONE_API_KEY;
    this.indexName = pineconeIndexName || env.PINECONE_INDEX_NAME || process.env.PINECONE_INDEX_NAME || 'patent-embeddings';

    this.ollama = new Ollama({ host: baseUrl });

    if (!apiKey && !mockMode) {
      Logger.warn(`PINECONE_API_KEY is not set in environment variables.`);
    }

    if (apiKey && !mockMode) {
      this.pineconeClient = new Pinecone({ apiKey });
    }
  }

  /**
   * Retries an async operation with exponential backoff.
   */
  private async retryWithBackoff<T>(fn: () => Promise<T>, serviceName: string): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt === this.maxRetries) break;
        const delayMs = 500 * Math.pow(2, attempt - 1);
        Logger.warn(`${serviceName} request failed (Attempt ${attempt}/${this.maxRetries}). Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw lastError;
  }

  /**
   * Generates embedding for search query prompt using Ollama.
   */
  public async generateQueryEmbedding(query: string): Promise<{ embedding: number[]; durationMs: number }> {
    const startTime = Date.now();

    const response = await this.retryWithBackoff(async () => {
      return await this.ollama.embed({
        model: this.embeddingModel,
        input: query,
      });
    }, 'Ollama Embedding');

    const durationMs = Date.now() - startTime;

    if (!response || !response.embeddings || response.embeddings.length === 0) {
      throw new Error(`Failed to generate query embedding for input query.`);
    }

    const embedding = response.embeddings[0];
    if (!embedding) {
      throw new Error(`Received empty embedding vector from Ollama API.`);
    }

    return { embedding, durationMs };
  }

  /**
   * Queries Pinecone index using query embedding vector.
   */
  public async queryPinecone(
    queryVector: number[],
    topK = 100
  ): Promise<{ results: SearchResultItem[]; durationMs: number }> {
    const startTime = Date.now();

    if (this.isMockMode || !this.pineconeClient) {
      if (!this.isMockMode && !this.pineconeClient) {
        throw new Error(
          `Pinecone client is not initialized. Please set PINECONE_API_KEY environment variable or run with --mock.`
        );
      }
      // Mock result simulation
      const mockResults: SearchResultItem[] = Array.from({ length: Math.min(topK, 5) }).map((_, i) => ({
        rank: i + 1,
        patentId: `US${10000000 + i}`,
        section: i % 3 === 0 ? 'title' : i % 3 === 1 ? 'abstract' : 'claims',
        score: parseFloat((0.95 - i * 0.05).toFixed(4)),
        ipc: 'B60L053/12',
        vectorId: `US${10000000 + i}_${i % 3 === 0 ? 'title' : i % 3 === 1 ? 'abstract' : 'claims'}`,
      }));
      return { results: mockResults, durationMs: Date.now() - startTime };
    }

    const index = this.pineconeClient.index<PatentVectorMetadata>(this.indexName);

    const queryResponse = await this.retryWithBackoff(async () => {
      return await index.query({
        vector: queryVector,
        topK,
        includeMetadata: true,
      });
    }, 'Pinecone Query');

    const durationMs = Date.now() - startTime;

    const matches = queryResponse.matches || [];

    // Sort vector matches descending by similarity score
    const sortedMatches = [...matches].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    const results: SearchResultItem[] = sortedMatches.map((match, index) => {
      const meta = match.metadata;
      return {
        rank: index + 1,
        patentId: meta?.patentId || match.id.split('_')[0] || 'N/A',
        section: meta?.section || match.id.split('_')[1] || 'N/A',
        score: parseFloat((match.score ?? 0).toFixed(4)),
        ipc: meta?.ipc || 'N/A',
        vectorId: match.id,
      };
    });

    return { results, durationMs };
  }

  /**
   * End-to-end semantic search pipeline.
   */
  public async executeSearch(
    queryText: string,
    topK = 100
  ): Promise<{ results: SearchResultItem[]; metrics: SearchMetrics }> {
    const totalStart = Date.now();

    const trimmedQuery = queryText ? queryText.trim() : '';
    if (!trimmedQuery) {
      throw new Error(`Search query cannot be empty. Please specify a search prompt.`);
    }

    Logger.info(`Executing semantic search for query: "${trimmedQuery}"`);

    // Step 1: Generate query embedding via Ollama nomic-embed-text
    const { embedding, durationMs: queryEmbeddingTimeMs } = await this.generateQueryEmbedding(trimmedQuery);
    Logger.info(`Generated query vector (${embedding.length} dims) in ${queryEmbeddingTimeMs}ms`);

    // Step 2: Query Pinecone index for Top-K candidates
    const { results, durationMs: pineconeSearchTimeMs } = await this.queryPinecone(embedding, topK);

    const totalExecutionTimeMs = Date.now() - totalStart;

    const metrics: SearchMetrics = {
      queryEmbeddingTimeMs,
      pineconeSearchTimeMs,
      totalExecutionTimeMs,
      totalResults: results.length,
    };

    return { results, metrics };
  }

  /**
   * Formats and prints search results and timing breakdown to stdout.
   */
  public printResults(queryText: string, results: SearchResultItem[], metrics: SearchMetrics): void {
    console.log('\n========================================================================================');
    console.log(`                     PATENTIQ TOP-${results.length} PRIOR-ART SEMANTIC SEARCH RESULTS              `);
    console.log('========================================================================================');
    console.log(`Query: "${queryText.trim()}"`);
    console.log(`Total Candidates Found: ${results.length}`);
    console.log('----------------------------------------------------------------------------------------');
    console.log(' RANK | SIMILARITY | PATENT ID    | SECTION   | IPC CODES                               ');
    console.log('----------------------------------------------------------------------------------------');

    results.forEach((res) => {
      const rankStr = String(res.rank).padStart(4, ' ');
      const scoreStr = res.score.toFixed(4).padStart(10, ' ');
      const patentIdStr = res.patentId.padEnd(12, ' ');
      const sectionStr = res.section.padEnd(9, ' ');
      const ipcStr = res.ipc.padEnd(15, ' ');
      console.log(` ${rankStr} | ${scoreStr} | ${patentIdStr} | ${sectionStr} | ${ipcStr}`);
    });

    console.log('----------------------------------------------------------------------------------------');
    console.log('                                  PERFORMANCE METRICS                                   ');
    console.log('----------------------------------------------------------------------------------------');
    console.log(`Query Embedding Time (Ollama):   ${metrics.queryEmbeddingTimeMs} ms`);
    console.log(`Vector Index Search (Pinecone):  ${metrics.pineconeSearchTimeMs} ms`);
    console.log(`Total Execution Latency:         ${metrics.totalExecutionTimeMs} ms`);
    console.log('========================================================================================\n');
  }
}

/**
 * CLI Main execution entry point.
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  let mockMode = false;
  let topK = 100;
  const queryParts: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    if (arg === '--mock') {
      mockMode = true;
    } else if (arg === '--top-k' && nextArg) {
      topK = parseInt(nextArg, 10) || 100;
      i++;
    } else if (arg && !arg.startsWith('--')) {
      queryParts.push(arg);
    }
  }

  const queryText = queryParts.join(' ').trim();

  if (!queryText) {
    console.error('\n[ERROR] Missing search query argument.\n');
    console.log('Usage:');
    console.log('  npm run semantic-search -- "wireless charging for electric vehicles"');
    console.log('  tsx src/modules/patents/scripts/semanticSearch.ts "wireless charging for electric vehicles"\n');
    process.exit(1);
  }

  const apiKey = process.env.PINECONE_API_KEY || env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME || env.PINECONE_INDEX_NAME || 'patent-embeddings';
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const embeddingModel = process.env.OLLAMA_EMBEDDING_MODEL || env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

  if (!apiKey && !mockMode) {
    console.error('\n[ERROR] PINECONE_API_KEY environment variable is not set.');
    console.error('Please set PINECONE_API_KEY or run with --mock for testing offline.\n');
    process.exit(1);
  }

  const searcher = new PatentSemanticSearcher(
    ollamaBaseUrl,
    embeddingModel,
    apiKey,
    indexName,
    3,
    mockMode
  );

  try {
    const { results, metrics } = await searcher.executeSearch(queryText, topK);
    searcher.printResults(queryText, results, metrics);
  } catch (error) {
    Logger.error('Semantic search failed.', error);
    process.exit(1);
  }
}

// Execute script if run directly
const scriptPath = process.argv[1];
if (scriptPath && (import.meta.url === `file://${scriptPath}` || scriptPath.endsWith('semanticSearch.ts'))) {
  main();
}
