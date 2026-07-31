import { z } from 'zod';
import { env } from '../../../config/env.config.js';
import type {
  BenchmarkRequest,
  BenchmarkReport,
  BenchmarkSummary,
  RetrievalQualityMetrics,
} from '../interfaces/benchmark.interface.js';

/**
 * Zod validation schema for POST /api/search/benchmark request payload.
 */
export const BenchmarkRequestDtoSchema = z.object({
  queries: z
    .array(
      z.string({ message: 'query must be a string' }).trim().min(1, 'query cannot be empty')
    )
    .min(1, 'queries array must contain at least 1 query'),
  topK: z
    .number({ message: 'topK must be a number' })
    .int('topK must be an integer')
    .min(1, 'topK must be at least 1')
    .max(100, 'maximum topK is 100')
    .optional()
    .default(env.DEFAULT_TOP_K),
  iterations: z
    .number({ message: 'iterations must be a number' })
    .int('iterations must be an integer')
    .min(1, 'iterations must be at least 1')
    .max(50, 'maximum iterations is 50')
    .optional()
    .default(env.BENCHMARK_ITERATIONS),
  groundTruth: z.record(z.string(), z.array(z.string())).optional(),
});

export type BenchmarkRequestDto = z.infer<typeof BenchmarkRequestDtoSchema>;

/**
 * Zod schema for benchmark summary statistics.
 */
export const BenchmarkSummaryDtoSchema = z.object({
  queries: z.number(),
  averageLatency: z.number(),
  p95Latency: z.number(),
  p99Latency: z.number(),
  averageEmbeddingTime: z.number(),
  averageSearchTime: z.number(),
  averageTotalTime: z.number(),
  throughput: z.number(),
});

/**
 * Zod schema for IR quality metrics.
 */
export const RetrievalQualityMetricsDtoSchema = z.object({
  precisionAt10: z.number().nullable(),
  recallAt10: z.number().nullable(),
  mrr: z.number().nullable(),
  ndcg: z.number().nullable(),
  hitRate: z.number().nullable(),
});

/**
 * Zod schema for full benchmark report response.
 */
export const BenchmarkReportDtoSchema = z.object({
  success: z.boolean(),
  summary: BenchmarkSummaryDtoSchema,
  quality: RetrievalQualityMetricsDtoSchema,
  recommendations: z.array(z.string()),
  executionTimeMs: z.number().optional(),
});

export type BenchmarkReportDto = z.infer<typeof BenchmarkReportDtoSchema>;

export type {
  BenchmarkRequest,
  BenchmarkReport,
  BenchmarkSummary,
  RetrievalQualityMetrics,
};
