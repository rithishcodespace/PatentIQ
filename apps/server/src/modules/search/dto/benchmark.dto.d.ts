import { z } from 'zod';
import type { BenchmarkRequest, BenchmarkReport, BenchmarkSummary, RetrievalQualityMetrics } from '../interfaces/benchmark.interface.js';
/**
 * Zod validation schema for POST /api/search/benchmark request payload.
 */
export declare const BenchmarkRequestDtoSchema: z.ZodObject<{
    queries: z.ZodArray<z.ZodString>;
    topK: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    iterations: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    groundTruth: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export type BenchmarkRequestDto = z.infer<typeof BenchmarkRequestDtoSchema>;
/**
 * Zod schema for benchmark summary statistics.
 */
export declare const BenchmarkSummaryDtoSchema: z.ZodObject<{
    queries: z.ZodNumber;
    averageLatency: z.ZodNumber;
    p95Latency: z.ZodNumber;
    p99Latency: z.ZodNumber;
    averageEmbeddingTime: z.ZodNumber;
    averageSearchTime: z.ZodNumber;
    averageTotalTime: z.ZodNumber;
    throughput: z.ZodNumber;
}, z.core.$strip>;
/**
 * Zod schema for IR quality metrics.
 */
export declare const RetrievalQualityMetricsDtoSchema: z.ZodObject<{
    precisionAt10: z.ZodNullable<z.ZodNumber>;
    recallAt10: z.ZodNullable<z.ZodNumber>;
    mrr: z.ZodNullable<z.ZodNumber>;
    ndcg: z.ZodNullable<z.ZodNumber>;
    hitRate: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Zod schema for full benchmark report response.
 */
export declare const BenchmarkReportDtoSchema: z.ZodObject<{
    success: z.ZodBoolean;
    summary: z.ZodObject<{
        queries: z.ZodNumber;
        averageLatency: z.ZodNumber;
        p95Latency: z.ZodNumber;
        p99Latency: z.ZodNumber;
        averageEmbeddingTime: z.ZodNumber;
        averageSearchTime: z.ZodNumber;
        averageTotalTime: z.ZodNumber;
        throughput: z.ZodNumber;
    }, z.core.$strip>;
    quality: z.ZodObject<{
        precisionAt10: z.ZodNullable<z.ZodNumber>;
        recallAt10: z.ZodNullable<z.ZodNumber>;
        mrr: z.ZodNullable<z.ZodNumber>;
        ndcg: z.ZodNullable<z.ZodNumber>;
        hitRate: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>;
    recommendations: z.ZodArray<z.ZodString>;
    executionTimeMs: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type BenchmarkReportDto = z.infer<typeof BenchmarkReportDtoSchema>;
export type { BenchmarkRequest, BenchmarkReport, BenchmarkSummary, RetrievalQualityMetrics, };
//# sourceMappingURL=benchmark.dto.d.ts.map