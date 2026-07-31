/**
 * Ground truth map matching query strings to arrays of known relevant Patent IDs.
 */
export type GroundTruthMap = Record<string, string[]>;

/**
 * Incoming request interface for benchmarking.
 */
export interface BenchmarkRequest {
  queries: string[];
  topK?: number | undefined;
  iterations?: number | undefined;
  groundTruth?: GroundTruthMap | undefined;
}

/**
 * Latency and retrieval metrics collected during a single query execution run.
 */
export interface SingleQueryMetric {
  query: string;
  embeddingTimeMs: number;
  searchTimeMs: number;
  totalTimeMs: number;
  retrievedCount: number;
  retrievedPatentIds: string[];
}

/**
 * Performance summary statistics aggregated across all benchmark query iterations.
 */
export interface BenchmarkSummary {
  queries: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  averageEmbeddingTime: number;
  averageSearchTime: number;
  averageTotalTime: number;
  throughput: number;
}

/**
 * Information Retrieval (IR) Quality Metrics.
 * Computed when ground truth relevance labels are provided, otherwise null.
 */
export interface RetrievalQualityMetrics {
  precisionAt10: number | null;
  recallAt10: number | null;
  precisionAtK?: number | null | undefined;
  recallAtK?: number | null | undefined;
  mrr: number | null;
  ndcg: number | null;
  hitRate: number | null;
}

/**
 * Complete structured report returned by POST /api/search/benchmark.
 */
export interface BenchmarkReport {
  success: boolean;
  summary: BenchmarkSummary;
  quality: RetrievalQualityMetrics;
  recommendations: string[];
  executionTimeMs?: number | undefined;
}

/**
 * Benchmark Service Contract.
 */
export interface IBenchmarkService {
  /**
   * Executes performance benchmarking and IR quality evaluation over input queries.
   */
  runBenchmark(request: BenchmarkRequest): Promise<BenchmarkReport>;
}
