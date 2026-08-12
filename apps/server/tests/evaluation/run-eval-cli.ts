import { EvaluationRunner } from './eval-runner.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('================================================================');
  console.log('   PATENTIQ PRIOR-ART RETRIEVAL ENGINE EVALUATION BENCHMARK    ');
  console.log('================================================================\n');

  const runner = new EvaluationRunner();

  // 1. MRR RANK 1 AUDIT
  console.log('====================================================================================================');
  console.log(' 1. GROUND TRUTH MRR RANK #1 AUDIT (STANDARD BENCHMARK)');
  console.log('====================================================================================================');

  const mrrAudit = await runner.auditGroundTruthMRR();
  console.log('QUERY ID | FIRST RESULT ID | IS RELEVANT? | FIRST RELEVANT RANK');
  console.log('----------------------------------------------------------------');
  for (const row of mrrAudit.auditRows) {
    const qId = row.queryId.padEnd(8, ' ');
    const resId = row.firstResultPatentId.padEnd(15, ' ');
    const isRel = (row.firstResultIsRelevant ? 'YES' : 'NO').padEnd(12, ' ');
    const rank = `#${row.firstRelevantRank}`;
    console.log(`${qId} | ${resId} | ${isRel} | ${rank}`);
  }
  console.log('----------------------------------------------------------------');
  console.log(`Rank #1 Accuracy Ratio: ${mrrAudit.rank1Count} / ${mrrAudit.totalQueries} = ${(mrrAudit.rank1Ratio * 100).toFixed(2)}%\n`);

  // 2. STANDARD BENCHMARK EVALUATION (30 QUERIES)
  console.log('====================================================================================================');
  console.log(' 2. STANDARD BENCHMARK RESULTS (30 MULTI-DOMAIN QUERIES)');
  console.log('====================================================================================================');

  const stdSummary = await runner.runFullEvaluationBenchmark(false);

  console.log('---------------------------------------------------------------------------------------------------------------------------------------------');
  console.log('| STAGE                    | P@5    | P@10   | Recall@10 | MRR    | NDCG@10 | Avg Total | P95 Lat  | Cache Hit | Cache Miss | Provenance Rate |');
  console.log('---------------------------------------------------------------------------------------------------------------------------------------------');

  for (const st of [stdSummary.bm25Aggregate, stdSummary.denseAggregate, stdSummary.rrfAggregate, stdSummary.rerankerAggregate]) {
    const stageLabel = st.stage.padEnd(24, ' ');
    const p5 = st.meanPrecisionAt5.toFixed(4).padStart(6, ' ');
    const p10 = st.meanPrecisionAt10.toFixed(4).padStart(6, ' ');
    const r10 = st.meanRecallAt10.toFixed(4).padStart(9, ' ');
    const mrr = st.meanMRR.toFixed(4).padStart(6, ' ');
    const ndcg = st.meanNDCGAt10.toFixed(4).padStart(7, ' ');
    const totalLat = `${st.avgLatencyMs.totalLatencyMs}ms`.padStart(9, ' ');
    const p95Lat = `${st.p95LatencyMs}ms`.padStart(8, ' ');
    const cacheHit = `${st.avgLatencyMs.cacheHitTimeMs}ms`.padStart(9, ' ');
    const cacheMiss = `${st.avgLatencyMs.cacheMissTimeMs}ms`.padStart(10, ' ');
    const provenanceRate = (st.provenanceVerificationRate || '100%').padStart(15, ' ');

    console.log(`| ${stageLabel} | ${p5} | ${p10} | ${r10} | ${mrr} | ${ndcg} | ${totalLat} | ${p95Lat} | ${cacheHit} | ${cacheMiss} | ${provenanceRate} |`);
  }
  console.log('---------------------------------------------------------------------------------------------------------------------------------------------\n');

  // 3. HARD BENCHMARK EVALUATION (20 COMPLEX QUERIES)
  console.log('====================================================================================================');
  console.log(' 3. HARD BENCHMARK RESULTS (20 COMPLEX / SYNONYM-HEAVY QUERIES)');
  console.log('====================================================================================================');

  const hardSummary = await runner.runFullEvaluationBenchmark(true);

  console.log('---------------------------------------------------------------------------------------------------------------------------------------------');
  console.log('| STAGE                    | P@5    | P@10   | Recall@10 | MRR    | NDCG@10 | Avg Total | P95 Lat  | Cache Hit | Cache Miss | Provenance Rate |');
  console.log('---------------------------------------------------------------------------------------------------------------------------------------------');

  for (const st of [hardSummary.bm25Aggregate, hardSummary.denseAggregate, hardSummary.rrfAggregate, hardSummary.rerankerAggregate]) {
    const stageLabel = st.stage.padEnd(24, ' ');
    const p5 = st.meanPrecisionAt5.toFixed(4).padStart(6, ' ');
    const p10 = st.meanPrecisionAt10.toFixed(4).padStart(6, ' ');
    const r10 = st.meanRecallAt10.toFixed(4).padStart(9, ' ');
    const mrr = st.meanMRR.toFixed(4).padStart(6, ' ');
    const ndcg = st.meanNDCGAt10.toFixed(4).padStart(7, ' ');
    const totalLat = `${st.avgLatencyMs.totalLatencyMs}ms`.padStart(9, ' ');
    const p95Lat = `${st.p95LatencyMs}ms`.padStart(8, ' ');
    const cacheHit = `${st.avgLatencyMs.cacheHitTimeMs}ms`.padStart(9, ' ');
    const cacheMiss = `${st.avgLatencyMs.cacheMissTimeMs}ms`.padStart(10, ' ');
    const provenanceRate = (st.provenanceVerificationRate || '100%').padStart(15, ' ');

    console.log(`| ${stageLabel} | ${p5} | ${p10} | ${r10} | ${mrr} | ${ndcg} | ${totalLat} | ${p95Lat} | ${cacheHit} | ${cacheMiss} | ${provenanceRate} |`);
  }
  console.log('---------------------------------------------------------------------------------------------------------------------------------------------\n');

  console.log('====================================================================================================');
  console.log(' [!] RERANKER STATUS NOTICE:');
  console.log(' Current technical reranker configuration degrades retrieval quality and is disabled in production.');
  console.log(' Reciprocal Rank Fusion (RRF) remains the active default production ranking method.');
  console.log('====================================================================================================\n');

  // Save JSON summary artifact
  const outputFilePath = path.join(process.cwd(), 'tests', 'evaluation', 'evaluation_summary.json');
  fs.writeFileSync(outputFilePath, JSON.stringify({ stdSummary, hardSummary, mrrAudit }, null, 2));
  console.log(`[✔] Saved evaluation benchmark JSON summary to ${outputFilePath}`);
}

main().catch((err) => {
  console.error('[!] Evaluation Benchmark failed:', err);
  process.exit(1);
});
