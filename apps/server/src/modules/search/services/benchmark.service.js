import { MetricsCalculator } from '../utils/metrics-calculator.js';
import { env } from '../../../config/env.config.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';
export class BenchmarkService {
    searchService;
    constructor(searchService) {
        this.searchService = searchService;
    }
    /**
     * Executes multi-query, multi-iteration benchmarking and IR quality evaluation over the search engine.
     */
    async runBenchmark(request) {
        const overallStart = Date.now();
        const queries = request.queries || [];
        if (queries.length === 0) {
            throw new BadRequestError('queries array cannot be empty');
        }
        const topK = request.topK ?? env.DEFAULT_TOP_K ?? 10;
        if (topK < 1 || topK > 100) {
            throw new BadRequestError('maximum topK is 100');
        }
        const iterations = request.iterations ?? env.BENCHMARK_ITERATIONS ?? 5;
        if (iterations < 1 || iterations > 50) {
            throw new BadRequestError('maximum iterations is 50');
        }
        const collectedMetrics = [];
        // Execute query iterations sequentially to capture precise latency profiles
        for (let iter = 0; iter < iterations; iter++) {
            for (const queryText of queries) {
                const trimmedQuery = queryText.trim();
                if (!trimmedQuery)
                    continue;
                const searchRes = await this.searchService.search({ query: trimmedQuery, topK });
                const results = searchRes.results || [];
                const retrievedPatentIds = results.map((r) => r.patentId);
                const metric = {
                    query: trimmedQuery,
                    embeddingTimeMs: searchRes.metrics?.queryEmbeddingTimeMs ?? 0,
                    searchTimeMs: searchRes.metrics?.pineconeSearchTimeMs ?? 0,
                    totalTimeMs: searchRes.metrics?.totalExecutionTimeMs ?? 0,
                    retrievedCount: searchRes.count,
                    retrievedPatentIds,
                };
                collectedMetrics.push(metric);
            }
        }
        const totalExecutionTimeMs = Date.now() - overallStart;
        // Calculate aggregated stats, percentiles, and quality metrics
        const summary = MetricsCalculator.calculateSummary(collectedMetrics, totalExecutionTimeMs);
        const quality = MetricsCalculator.calculateQualityMetrics(collectedMetrics, request.groundTruth, topK);
        const recommendations = MetricsCalculator.generateRecommendations(summary, quality, env.ENABLE_QUERY_CACHE);
        console.log(`[BenchmarkService] Benchmark Run Completed | totalRuns=${summary.queries} | iterations=${iterations} | averageLatency=${summary.averageLatency}ms | P95=${summary.p95Latency}ms | P99=${summary.p99Latency}ms | throughput=${summary.throughput} req/s | totalTime=${totalExecutionTimeMs}ms`);
        return {
            success: true,
            summary,
            quality,
            recommendations,
            executionTimeMs: totalExecutionTimeMs,
        };
    }
}
//# sourceMappingURL=benchmark.service.js.map