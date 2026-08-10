import type { SingleQueryMetric, BenchmarkSummary, RetrievalQualityMetrics, GroundTruthMap } from '../interfaces/benchmark.interface.js';
export declare class MetricsCalculator {
    /**
     * Calculates performance summary statistics (Average, P95, P99, Throughput).
     */
    static calculateSummary(metrics: SingleQueryMetric[], totalExecutionTimeMs: number): BenchmarkSummary;
    /**
     * Computes Information Retrieval (IR) quality metrics (Precision@K, Recall@K, MRR, NDCG@K, Hit Rate@K).
     * Returns null for all fields if groundTruth map is empty or undefined.
     */
    static calculateQualityMetrics(metrics: SingleQueryMetric[], groundTruth?: GroundTruthMap, topK?: number): RetrievalQualityMetrics;
    /**
     * Generates actionable performance recommendations based on metric thresholds.
     */
    static generateRecommendations(summary: BenchmarkSummary, quality: RetrievalQualityMetrics, cacheEnabled: boolean): string[];
    /**
     * Helper utility calculating average of an array of numbers.
     */
    static average(numbers: number[]): number;
    /**
     * Helper utility calculating percentile value from a sorted array of numbers.
     */
    static percentile(sortedNumbers: number[], p: number): number;
}
//# sourceMappingURL=metrics-calculator.d.ts.map