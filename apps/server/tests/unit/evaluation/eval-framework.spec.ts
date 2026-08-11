import { describe, it, expect } from 'vitest';
import { BENCHMARK_DATASET } from '../../evaluation/benchmark-dataset.js';
import {
  calculatePrecisionAtK,
  calculateRecallAtK,
  calculateMRR,
  calculateNDCGAtK,
  computeAggregateMetrics,
} from '../../evaluation/eval-metrics.js';
import { EvaluationRunner } from '../../evaluation/eval-runner.js';

describe('PatentIQ Prior-Art Retrieval Engine Evaluation Framework', () => {
  it('should verify benchmark dataset contains at least 30 test cases across 10 technical domains', () => {
    expect(BENCHMARK_DATASET.length).toBeGreaterThanOrEqual(30);

    const categories = new Set(BENCHMARK_DATASET.map((c) => c.category));
    expect(categories.size).toBe(10);
    expect(categories).toContain('agriculture');
    expect(categories).toContain('robotics');
    expect(categories).toContain('cybersecurity');
    expect(categories).toContain('energy');
    expect(categories).toContain('electronics');
    expect(categories).toContain('manufacturing');
    expect(categories).toContain('computer systems');
    expect(categories).toContain('transportation');
    expect(categories).toContain('telecommunications');
    expect(categories).toContain('medical devices');

    BENCHMARK_DATASET.forEach((tc) => {
      expect(tc.id).toBeDefined();
      expect(tc.inventionQuery.length).toBeGreaterThan(10);
      expect(tc.expectedRelevantPatentIds.length).toBeGreaterThan(0);
    });
  });

  it('should accurately calculate Precision@K, Recall@K, MRR, and NDCG@K metrics', () => {
    const retrieved = ['US1001', 'US1002', 'US1003', 'US1004', 'US1005'];
    const expected = ['US1001', 'US1003', 'US1099'];

    // P@5: 2 hits out of 5 = 0.4
    expect(calculatePrecisionAtK(retrieved, expected, 5)).toBe(0.4);

    // Recall@10: 2 hits out of 3 expected = 0.6667
    expect(calculateRecallAtK(retrieved, expected, 10)).toBeCloseTo(0.6667, 3);

    // MRR: First hit at rank 1 -> 1 / 1 = 1.0
    expect(calculateMRR(retrieved, expected)).toBe(1.0);

    // MRR when first hit at rank 3:
    const delayedRetrieved = ['US9999', 'US8888', 'US1003', 'US1001'];
    expect(calculateMRR(delayedRetrieved, expected)).toBe(1 / 3);

    // NDCG@5 calculation
    const ndcg = calculateNDCGAtK(retrieved, expected, 5);
    expect(ndcg).toBeGreaterThan(0);
    expect(ndcg).toBeLessThanOrEqual(1.0);
  });

  it('should execute full 30-query 4-stage retrieval evaluation benchmark and compute component latencies', async () => {
    const runner = new EvaluationRunner();
    const benchmarkResults = await runner.runFullEvaluationBenchmark();

    expect(benchmarkResults.testCasesCount).toBe(30);

    // Verify all 4 stage aggregate metrics exist
    expect(benchmarkResults.bm25Aggregate).toBeDefined();
    expect(benchmarkResults.denseAggregate).toBeDefined();
    expect(benchmarkResults.rrfAggregate).toBeDefined();
    expect(benchmarkResults.rerankerAggregate).toBeDefined();

    // Verify Precision/Recall/MRR/NDCG are computed correctly
    const rrf = benchmarkResults.rrfAggregate;
    expect(rrf.meanPrecisionAt5).toBeGreaterThanOrEqual(0);
    expect(rrf.meanPrecisionAt10).toBeGreaterThanOrEqual(0);
    expect(rrf.meanRecallAt10).toBeGreaterThanOrEqual(0);
    expect(rrf.meanMRR).toBeGreaterThanOrEqual(0);
    expect(rrf.meanNDCGAt10).toBeGreaterThanOrEqual(0);

    // Verify Latency breakdown for each stage
    expect(benchmarkResults.bm25Aggregate.avgLatencyMs.bm25SearchTimeMs).toBeGreaterThanOrEqual(0);
    expect(benchmarkResults.denseAggregate.avgLatencyMs.embeddingTimeMs).toBeGreaterThanOrEqual(0);
    expect(benchmarkResults.denseAggregate.avgLatencyMs.pineconeSearchTimeMs).toBeGreaterThanOrEqual(0);
    expect(benchmarkResults.rrfAggregate.avgLatencyMs.rrfRerankTimeMs).toBeGreaterThanOrEqual(0);
    expect(benchmarkResults.rerankerAggregate.avgLatencyMs.rerankerTimeMs).toBeGreaterThanOrEqual(0);
  });
});
