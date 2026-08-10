import type { ISearchService } from '../../search/interfaces/search.interface.js';
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
 * Standard benchmark evaluation sample queries.
 */
export declare const DEFAULT_BENCHMARK_QUERIES: string[];
/**
 * Patent Semantic Search Benchmarker Service.
 * Uses SearchService directly to run benchmarks.
 */
export declare class PatentSearchBenchmarker {
    private searchService;
    constructor(searchService: ISearchService);
    /**
     * Runs performance benchmark across array of sample test queries.
     */
    runBenchmark(queries: string[], topK?: number): Promise<BenchmarkReport>;
    /**
     * Displays benchmark summary report to stdout.
     */
    printReport(report: BenchmarkReport): void;
    /**
     * Saves benchmark report into target JSON file.
     */
    saveReport(report: BenchmarkReport, outputPath: string): void;
}
//# sourceMappingURL=benchmarkSearch.d.ts.map