import { EvaluationRunner } from './eval-runner.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('================================================================');
  console.log('   PATENTIQ PRIOR-ART RETRIEVAL ENGINE EVALUATION BENCHMARK    ');
  console.log('================================================================');
  console.log('Running 30 multi-domain benchmark queries across 4 retrieval stages...\n');

  const runner = new EvaluationRunner();
  const startTime = Date.now();
  const summary = await runner.runFullEvaluationBenchmark();
  const durationMs = Date.now() - startTime;

  console.log(`[✔] Evaluation completed in ${durationMs}ms for ${summary.testCasesCount} queries.\n`);

  console.log('-------------------------------------------------------------------------------------------------------------------------');
  console.log('| STAGE                    | P@5    | P@10   | Recall@10 | MRR    | NDCG@10 | Avg Latency | Embed Lat | Pinecone Lat | BM25 Lat | RRF Lat | Reranker Lat |');
  console.log('-------------------------------------------------------------------------------------------------------------------------');

  const stages = [
    summary.bm25Aggregate,
    summary.denseAggregate,
    summary.rrfAggregate,
    summary.rerankerAggregate,
  ];

  for (const st of stages) {
    const stageLabel = st.stage.padEnd(24, ' ');
    const p5 = st.meanPrecisionAt5.toFixed(4).padStart(6, ' ');
    const p10 = st.meanPrecisionAt10.toFixed(4).padStart(6, ' ');
    const r10 = st.meanRecallAt10.toFixed(4).padStart(9, ' ');
    const mrr = st.meanMRR.toFixed(4).padStart(6, ' ');
    const ndcg = st.meanNDCGAt10.toFixed(4).padStart(7, ' ');
    const totalLat = `${st.avgLatencyMs.totalLatencyMs}ms`.padStart(11, ' ');
    const embedLat = `${st.avgLatencyMs.embeddingTimeMs}ms`.padStart(9, ' ');
    const pineconeLat = `${st.avgLatencyMs.pineconeSearchTimeMs}ms`.padStart(12, ' ');
    const bm25Lat = `${st.avgLatencyMs.bm25SearchTimeMs}ms`.padStart(8, ' ');
    const rrfLat = `${st.avgLatencyMs.rrfRerankTimeMs}ms`.padStart(7, ' ');
    const rerankLat = `${st.avgLatencyMs.rerankerTimeMs}ms`.padStart(12, ' ');

    console.log(`| ${stageLabel} | ${p5} | ${p10} | ${r10} | ${mrr} | ${ndcg} | ${totalLat} | ${embedLat} | ${pineconeLat} | ${bm25Lat} | ${rrfLat} | ${rerankLat} |`);
  }
  console.log('-------------------------------------------------------------------------------------------------------------------------\n');

  // Save JSON summary artifact
  const outputFilePath = path.join(process.cwd(), 'tests', 'evaluation', 'evaluation_summary.json');
  fs.writeFileSync(outputFilePath, JSON.stringify(summary, null, 2));
  console.log(`[✔] Saved evaluation benchmark JSON summary to ${outputFilePath}`);
}

main().catch((err) => {
  console.error('[!] Evaluation Benchmark failed:', err);
  process.exit(1);
});
