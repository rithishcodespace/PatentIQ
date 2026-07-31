import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PatentSemanticSearcher } from './semanticSearch.js';
import { env } from '../../../config/env.config.js';

/**
 * Individual benchmark result for a single search query.
 */
export interface QueryBenchmarkResult {
  query: string;
  embeddingTimeMs: number;
  searchTimeMs: number;
  totalLatencyMs: number;
  resultsCount: number;
  highestSimilarityScore: number;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
}

/**
 * Aggregate summary metrics across all benchmarked queries.
 */
export interface BenchmarkSummary {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  totalBenchmarkDurationMs: number;
  avgEmbeddingTimeMs: number;
  avgSearchTimeMs: number;
  avgTotalLatencyMs: number;
  avgHighestSimilarityScore: number;
  queriesPerSecond: number;
  fastestQuery: {
    query: string;
    latencyMs: number;
  };
  slowestQuery: {
    query: string;
    latencyMs: number;
  };
}

/**
 * Full JSON benchmark report structure saved to file.
 */
export interface BenchmarkReport {
  timestamp: string;
  summary: BenchmarkSummary;
  queryResults: QueryBenchmarkResult[];
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
 * Standard benchmark evaluation sample queries.
 */
export const DEFAULT_BENCHMARK_QUERIES: string[] = [
  'wireless charging for electric vehicles',
  'lithium battery thermal management',
  'autonomous vehicle navigation',
  'image recognition using neural networks',
  'medical device for cardiac monitoring',
  'renewable energy storage system',
  'blockchain based identity verification',
  'drone obstacle avoidance',
  'industrial robotic arm control',
  'smart irrigation system',
];

/**
 * Patent Semantic Search Benchmarker Service.
 */
export class PatentSearchBenchmarker {
  private searcher: PatentSemanticSearcher;

  constructor(searcher: PatentSemanticSearcher) {
    this.searcher = searcher;
  }

  /**
   * Runs performance benchmark across array of sample test queries.
   */
  public async runBenchmark(queries: string[], topK = 100): Promise<BenchmarkReport> {
    const overallStartTime = Date.now();
    Logger.info(`Starting search benchmark suite over ${queries.length} queries...`);

    const queryResults: QueryBenchmarkResult[] = [];

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i]!;
      Logger.info(`[${i + 1}/${queries.length}] Benchmarking query: "${query}"`);

      try {
        const { results, metrics } = await this.searcher.executeSearch(query, topK);

        const highestSimilarityScore =
          results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0;

        queryResults.push({
          query,
          embeddingTimeMs: metrics.queryEmbeddingTimeMs,
          searchTimeMs: metrics.pineconeSearchTimeMs,
          totalLatencyMs: metrics.totalExecutionTimeMs,
          resultsCount: results.length,
          highestSimilarityScore: parseFloat(highestSimilarityScore.toFixed(4)),
          status: 'SUCCESS',
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        Logger.error(`Failed to benchmark query "${query}"`, err);

        queryResults.push({
          query,
          embeddingTimeMs: 0,
          searchTimeMs: 0,
          totalLatencyMs: 0,
          resultsCount: 0,
          highestSimilarityScore: 0,
          status: 'FAILED',
          error: errorMessage,
        });
      }
    }

    const totalBenchmarkDurationMs = Date.now() - overallStartTime;

    const successfulResults = queryResults.filter((r) => r.status === 'SUCCESS');
    const successfulCount = successfulResults.length;
    const failedCount = queryResults.length - successfulCount;

    let avgEmbeddingTimeMs = 0;
    let avgSearchTimeMs = 0;
    let avgTotalLatencyMs = 0;
    let avgHighestSimilarityScore = 0;

    let fastestQuery = { query: 'N/A', latencyMs: Infinity };
    let slowestQuery = { query: 'N/A', latencyMs: -1 };

    if (successfulCount > 0) {
      const sumEmbedding = successfulResults.reduce((acc, curr) => acc + curr.embeddingTimeMs, 0);
      const sumSearch = successfulResults.reduce((acc, curr) => acc + curr.searchTimeMs, 0);
      const sumTotal = successfulResults.reduce((acc, curr) => acc + curr.totalLatencyMs, 0);
      const sumScores = successfulResults.reduce((acc, curr) => acc + curr.highestSimilarityScore, 0);

      avgEmbeddingTimeMs = parseFloat((sumEmbedding / successfulCount).toFixed(2));
      avgSearchTimeMs = parseFloat((sumSearch / successfulCount).toFixed(2));
      avgTotalLatencyMs = parseFloat((sumTotal / successfulCount).toFixed(2));
      avgHighestSimilarityScore = parseFloat((sumScores / successfulCount).toFixed(4));

      successfulResults.forEach((res) => {
        if (res.totalLatencyMs < fastestQuery.latencyMs) {
          fastestQuery = { query: res.query, latencyMs: res.totalLatencyMs };
        }
        if (res.totalLatencyMs > slowestQuery.latencyMs) {
          slowestQuery = { query: res.query, latencyMs: res.totalLatencyMs };
        }
      });
    } else {
      fastestQuery = { query: 'N/A', latencyMs: 0 };
      slowestQuery = { query: 'N/A', latencyMs: 0 };
    }

    const durationSeconds = totalBenchmarkDurationMs / 1000;
    const queriesPerSecond =
      durationSeconds > 0 ? parseFloat((successfulCount / durationSeconds).toFixed(2)) : 0;

    const summary: BenchmarkSummary = {
      totalQueries: queries.length,
      successfulQueries: successfulCount,
      failedQueries: failedCount,
      totalBenchmarkDurationMs,
      avgEmbeddingTimeMs,
      avgSearchTimeMs,
      avgTotalLatencyMs,
      avgHighestSimilarityScore,
      queriesPerSecond,
      fastestQuery,
      slowestQuery,
    };

    const report: BenchmarkReport = {
      timestamp: new Date().toISOString(),
      summary,
      queryResults,
    };

    this.printReport(report);
    return report;
  }

  /**
   * Displays benchmark summary report to stdout.
   */
  public printReport(report: BenchmarkReport): void {
    const { summary, queryResults } = report;

    console.log('\n========================================================================================');
    console.log('                        PATENTIQ SEMANTIC SEARCH BENCHMARK REPORT                      ');
    console.log('========================================================================================');
    console.log(`Timestamp: ${report.timestamp}`);
    console.log('----------------------------------------------------------------------------------------');
    console.log(' QUERY NAME                             | EMBED (ms) | SEARCH (ms) | TOTAL (ms) | SCORE ');
    console.log('----------------------------------------------------------------------------------------');

    queryResults.forEach((q) => {
      const nameStr = q.query.length > 38 ? q.query.substring(0, 35) + '...' : q.query.padEnd(38, ' ');
      const embedStr = String(q.embeddingTimeMs).padStart(10, ' ');
      const searchStr = String(q.searchTimeMs).padStart(11, ' ');
      const totalStr = String(q.totalLatencyMs).padStart(10, ' ');
      const scoreStr = q.highestSimilarityScore.toFixed(4).padStart(5, ' ');

      console.log(` ${nameStr} | ${embedStr} | ${searchStr} | ${totalStr} | ${scoreStr}`);
    });

    console.log('----------------------------------------------------------------------------------------');
    console.log('                               AGGREGATE BENCHMARK METRICS                              ');
    console.log('----------------------------------------------------------------------------------------');
    console.log(`Total Queries Benchmarked:        ${summary.totalQueries}`);
    console.log(`Successful / Failed:              ${summary.successfulQueries} / ${summary.failedQueries}`);
    console.log(`Total Benchmark Time:             ${(summary.totalBenchmarkDurationMs / 1000).toFixed(2)} seconds`);
    console.log(`Average Query Embedding Time:     ${summary.avgEmbeddingTimeMs} ms`);
    console.log(`Average Vector Search Time:       ${summary.avgSearchTimeMs} ms`);
    console.log(`Average Total Latency:            ${summary.avgTotalLatencyMs} ms`);
    console.log(`Average Top Similarity Score:     ${summary.avgHighestSimilarityScore}`);
    console.log(`Throughput (QPS):                 ${summary.queriesPerSecond} queries/sec`);
    console.log(`Fastest Query:                    "${summary.fastestQuery.query}" (${summary.fastestQuery.latencyMs} ms)`);
    console.log(`Slowest Query:                    "${summary.slowestQuery.query}" (${summary.slowestQuery.latencyMs} ms)`);
    console.log('========================================================================================\n');
  }

  /**
   * Saves benchmark report into target JSON file.
   */
  public saveReport(report: BenchmarkReport, outputPath: string): void {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    Logger.success(`Saved benchmark report JSON to: ${outputPath}`);
  }
}

/**
 * CLI Main execution entry point.
 */
async function main(): Promise<void> {
  const currentFilePath = fileURLToPath(import.meta.url);
  const scriptsDir = path.dirname(currentFilePath);
  const patentsModuleDir = path.resolve(scriptsDir, '..');

  const defaultOutputPath = path.resolve(patentsModuleDir, 'dataset/processed/search_benchmark.json');

  const args = process.argv.slice(2);
  let outputPath = defaultOutputPath;
  let mockMode = false;
  let topK = 100;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    if (arg === '--output' && nextArg) {
      outputPath = path.resolve(nextArg);
      i++;
    } else if (arg === '--mock') {
      mockMode = true;
    } else if (arg === '--top-k' && nextArg) {
      topK = parseInt(nextArg, 10) || 100;
      i++;
    }
  }

  const apiKey = process.env.PINECONE_API_KEY || env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME || env.PINECONE_INDEX_NAME || 'patent-embeddings';
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const embeddingModel = process.env.OLLAMA_EMBEDDING_MODEL || env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

  if (!apiKey && !mockMode) {
    Logger.warn('PINECONE_API_KEY environment variable is not set. Switching to --mock mode for offline benchmark.');
    mockMode = true;
  }

  // Reuse existing PatentSemanticSearcher instance
  const searcher = new PatentSemanticSearcher(
    ollamaBaseUrl,
    embeddingModel,
    apiKey,
    indexName,
    3,
    mockMode
  );

  const benchmarker = new PatentSearchBenchmarker(searcher);

  try {
    const report = await benchmarker.runBenchmark(DEFAULT_BENCHMARK_QUERIES, topK);
    benchmarker.saveReport(report, outputPath);
  } catch (error) {
    Logger.error('Benchmark execution failed.', error);
    process.exit(1);
  }
}

// Execute script if run directly
const scriptPath = process.argv[1];
if (scriptPath && (import.meta.url === `file://${scriptPath}` || scriptPath.endsWith('benchmarkSearch.ts'))) {
  main();
}
