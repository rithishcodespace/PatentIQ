import { env } from '../../../config/env.config.js';
import { SearchService } from '../../search/services/search.service.js';
import { SearchRepository } from '../../search/repositories/search.repository.js';
import { OllamaEmbeddingProvider } from '../../../providers/embedding/ollama-embedding.provider.js';
import type { SearchMetrics, SearchResult } from '../../search/interfaces/search.interface.js';

/**
 * Interface representing a CLI ranked result item for printing.
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
 * Re-export SearchMetrics for script compatibility.
 */
export type { SearchMetrics };

/**
 * Formatted CLI Logger.
 */
class Logger {
  private static formatTime(): string {
    return new Date().toISOString();
  }

  static info(message: string): void {
    console.log(`[${this.formatTime()}] [INFO]  ${message}`);
  }

  static error(message: string, error?: unknown): void {
    console.error(`[${this.formatTime()}] [ERROR] ${message}`);
    if (error) {
      console.error(error);
    }
  }
}

/**
 * Thin CLI testing wrapper for Patent Semantic Search.
 * Contains zero business logic; delegates search execution to SearchService.
 */
export class PatentSemanticSearcher {
  private searchService: SearchService;

  constructor(
    ollamaBaseUrl?: string,
    embeddingModel?: string,
    pineconeApiKey?: string,
    pineconeIndexName?: string,
    maxRetries = 3,
    _mockMode = false
  ) {
    const baseUrl = ollamaBaseUrl || env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = embeddingModel || env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
    const apiKey = pineconeApiKey || env.PINECONE_API_KEY || process.env.PINECONE_API_KEY;
    const indexName = pineconeIndexName || env.PINECONE_INDEX_NAME || process.env.PINECONE_INDEX_NAME || 'patent-embeddings';

    const embeddingProvider = new OllamaEmbeddingProvider(baseUrl, model);
    const searchRepo = new SearchRepository(apiKey, indexName, maxRetries);

    this.searchService = new SearchService(embeddingProvider, searchRepo);
  }

  /**
   * Delegates search execution to SearchService.
   */
  public async executeSearch(
    queryText: string,
    topK = 100
  ): Promise<{ results: SearchResultItem[]; metrics: SearchMetrics }> {
    const { results, metrics } = await this.searchService.executeSearch(queryText, topK);

    const formattedItems: SearchResultItem[] = results.map((res: SearchResult, index: number) => ({
      rank: index + 1,
      patentId: res.patentId,
      section: res.title ? 'title' : res.abstract ? 'abstract' : 'general',
      score: res.score,
      ipc: res.ipc,
      vectorId: `${res.patentId}_${index}`,
    }));

    return { results: formattedItems, metrics };
  }

  /**
   * Prints formatted search results to stdout.
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
