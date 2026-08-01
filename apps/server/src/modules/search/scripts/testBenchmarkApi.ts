import { buildApp } from '../../../app.js';
import { MetricsCalculator } from '../utils/metrics-calculator.js';
import type { SingleQueryMetric } from '../interfaces/benchmark.interface.js';

async function runBenchmarkApiIntegrationTests() {
  console.log('\n========================================================');
  console.log('    PATENTIQ SEARCH BENCHMARK INTEGRATION TEST SUITE    ');
  console.log('========================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName} ${detail ? `(${detail})` : ''}`);
    }
  }

  // 1. MetricsCalculator Percentiles Unit Test
  console.log('--- Percentiles & Latency Aggregation Tests ---');
  const mockMetrics: SingleQueryMetric[] = [
    { query: 'q1', embeddingTimeMs: 50, searchTimeMs: 100, totalTimeMs: 150, retrievedCount: 10, retrievedPatentIds: ['PAT-1', 'PAT-2'] },
    { query: 'q1', embeddingTimeMs: 60, searchTimeMs: 140, totalTimeMs: 200, retrievedCount: 10, retrievedPatentIds: ['PAT-1', 'PAT-2'] },
    { query: 'q2', embeddingTimeMs: 40, searchTimeMs: 210, totalTimeMs: 250, retrievedCount: 10, retrievedPatentIds: ['PAT-3', 'PAT-4'] },
    { query: 'q2', embeddingTimeMs: 50, searchTimeMs: 450, totalTimeMs: 500, retrievedCount: 10, retrievedPatentIds: ['PAT-3', 'PAT-4'] },
  ];

  const summary = MetricsCalculator.calculateSummary(mockMetrics, 2000);
  assert(summary.queries === 4, 'MetricsCalculator: Aggregates total query run count (4)');
  assert(summary.averageLatency === 275, `MetricsCalculator: Calculates average total latency (275ms)`);
  assert(summary.averageEmbeddingTime === 50, 'MetricsCalculator: Calculates average embedding time (50ms)');
  assert(summary.averageSearchTime === 225, 'MetricsCalculator: Calculates average search time (225ms)');
  assert(summary.p95Latency > 0, 'MetricsCalculator: Calculates P95 latency');
  assert(summary.p99Latency >= summary.p95Latency, 'MetricsCalculator: P99 latency >= P95 latency');
  assert(summary.throughput === 2.0, `MetricsCalculator: Calculates throughput (2.0 req/s), got ${summary.throughput}`);

  // 2. Information Retrieval (IR) Quality Metrics Unit Test
  console.log('\n--- IR Quality Metrics (Precision, Recall, MRR, NDCG, Hit Rate) Tests ---');
  const groundTruth = {
    'q1': ['PAT-1', 'PAT-5'],
    'q2': ['PAT-99'],
  };

  const quality = MetricsCalculator.calculateQualityMetrics(mockMetrics, groundTruth, 10);
  assert(quality.precisionAt10 !== null, 'QualityMetrics: Calculates non-null Precision@10 when ground truth exists');
  assert(quality.recallAt10 !== null, 'QualityMetrics: Calculates non-null Recall@10 when ground truth exists');
  assert(quality.mrr === 0.5, `QualityMetrics: Calculates MRR (0.5), got ${quality.mrr}`); // q1 has PAT-1 at rank 1 (1.0), q2 has no hit (0.0) -> mean = 0.5
  assert(quality.hitRate === 0.5, `QualityMetrics: Calculates Hit Rate (0.5), got ${quality.hitRate}`); // q1 hit (1), q2 miss (0) -> mean = 0.5
  assert(quality.ndcg !== null && quality.ndcg > 0, 'QualityMetrics: Calculates NDCG metric');

  // Test without ground truth
  const qualityNull = MetricsCalculator.calculateQualityMetrics(mockMetrics, undefined, 10);
  assert(qualityNull.precisionAt10 === null, 'QualityMetrics: Returns null precision when ground truth is omitted');
  assert(qualityNull.mrr === null, 'QualityMetrics: Returns null MRR when ground truth is omitted');

  // Test Recommendations Engine
  console.log('\n--- Performance Recommendations Engine Tests ---');
  const recs = MetricsCalculator.generateRecommendations(summary, quality, false);
  assert(recs.length >= 3, 'RecommendationsEngine: Generates performance recommendations');
  assert(recs.some(r => r.includes('ENABLE_QUERY_CACHE=false')), 'RecommendationsEngine: Identifies disabled query cache');

  // 3. Fastify Endpoint Integration Tests
  console.log('\n--- Fastify Endpoint Integration Tests ---');
  const app = await buildApp();
  await app.ready();

  try {
    // Validation Test: Empty queries array
    const resEmptyQueries = await app.inject({
      method: 'POST',
      url: '/api/search/benchmark',
      payload: { queries: [] },
    });
    assert(resEmptyQueries.statusCode === 400, 'Validation: Empty queries array returns HTTP 400');

    // Validation Test: topK > 100
    const resTopKExceeded = await app.inject({
      method: 'POST',
      url: '/api/search/benchmark',
      payload: { queries: ['wireless charging'], topK: 150 },
    });
    assert(resTopKExceeded.statusCode === 400, 'Validation: topK > 100 returns HTTP 400');

    // Validation Test: iterations > 50
    const resIterExceeded = await app.inject({
      method: 'POST',
      url: '/api/search/benchmark',
      payload: { queries: ['wireless charging'], iterations: 100 },
    });
    assert(resIterExceeded.statusCode === 400, 'Validation: iterations > 50 returns HTTP 400');

    // Endpoint Execution Test: POST /api/search/benchmark
    const resValid = await app.inject({
      method: 'POST',
      url: '/api/search/benchmark',
      payload: {
        queries: ['wireless charging', 'drone navigation'],
        topK: 5,
        iterations: 2,
      },
    });

    console.log(`\nResponse Status for POST /api/search/benchmark: ${resValid.statusCode}`);
    const validBody = JSON.parse(resValid.payload);

    if (resValid.statusCode === 200) {
      assert(validBody.success === true, 'Response contains success: true');
      assert(validBody.summary && typeof validBody.summary.averageLatency === 'number', 'Response contains summary metrics');
      assert(typeof validBody.summary.p95Latency === 'number', 'Summary contains P95 latency');
      assert(typeof validBody.summary.p99Latency === 'number', 'Summary contains P99 latency');
      assert(typeof validBody.summary.throughput === 'number', 'Summary contains throughput');
      assert(validBody.quality && validBody.quality.precisionAt10 === null, 'Quality metrics default to null when ground truth omitted');
      assert(Array.isArray(validBody.recommendations), 'Response contains recommendations array');

      console.log('\nSample Benchmark Report Payload:');
      console.log(JSON.stringify(validBody, null, 2));
    } else if (resValid.statusCode === 503) {
      console.log(`[INFO] Downstream dependency unavailable (Ollama / Pinecone): ${validBody.message}`);
      assert(
        validBody.error === 'ServiceUnavailableError',
        'ServiceUnavailableError properly handled with HTTP 503'
      );
    }

    console.log(`\n========================================================`);
    console.log(`        TEST SUMMARY: Passed ${passedTests}/${totalTests} tests`);
    console.log(`========================================================\n`);

    await app.close();
  } catch (error) {
    console.error('Benchmark API Integration test execution failed:', error);
    await app.close();
    process.exit(1);
  }
}

runBenchmarkApiIntegrationTests();
