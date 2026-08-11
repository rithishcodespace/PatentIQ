import { BENCHMARK_DATASET } from './benchmark-dataset.js';
import { EVALUATION_CORPUS } from './eval-runner.js';
import { PatentProvenanceValidator } from '../../src/modules/search/validators/patent-provenance.validator.js';
import type { SearchResult } from '../../src/modules/search/interfaces/search.interface.js';
import * as fs from 'fs';
import * as path from 'path';

async function runProvenanceAudit() {
  console.log('================================================================');
  console.log('         PATENTIQ STRICT PATENT PROVENANCE AUDIT RUNNER         ');
  console.log('================================================================\n');

  const validator = new PatentProvenanceValidator();

  // 1. Audit 30 Real Retrieved Patent Results from Corpus
  console.log('[1/3] Auditing 30 Real Retrieved Patents from Dataset Corpus...');
  const corpusResults: SearchResult[] = EVALUATION_CORPUS.map((p, idx) => ({
    rank: idx + 1,
    score: 0.95 - idx * 0.01,
    patentId: p.patentId,
    publicationNumber: p.patentId,
    title: p.title,
    abstract: p.abstract,
    claims: p.claims,
    ipc: p.ipc || 'A01B',
    sourceUrl: `https://patents.google.com/patent/${p.patentId}/en`,
  }));

  let corpusPassed = 0;
  let corpusFailed = 0;
  for (const item of corpusResults) {
    const audit = validator.validateResult(item);
    if (audit.isValid) {
      corpusPassed++;
    } else {
      corpusFailed++;
      console.warn(` [!] Corpus Patent Audit Failed for ${item.patentId}:`, audit.violations);
    }
  }
  console.log(` -> Corpus Audit Results: ${corpusPassed}/${corpusResults.length} PASSED (${corpusFailed} failed)\n`);

  // 2. Audit Intentionally Injected Mismatches (Cross-Contamination Stress Test)
  console.log('[2/3] Auditing Intentionally Injected Metadata Mismatches (Stress Test)...');
  const syntheticMismatches: SearchResult[] = [
    {
      rank: 1,
      score: 0.99,
      patentId: 'US1001',
      publicationNumber: 'US-9999999-B2', // ID vs Pub Number mismatch
      title: 'Autonomous drone inspection system',
      abstract: 'An agricultural drone equipped with multispectral imaging.',
      sourceUrl: 'https://patents.google.com/patent/US1001/en',
      ipc: 'A01B',
    },
    {
      rank: 2,
      score: 0.95,
      patentId: 'US2001',
      publicationNumber: 'US2001',
      title: 'Mobile Robot Navigation',
      abstract: 'LiDAR visual SLAM system.',
      sourceUrl: 'https://patents.google.com/patent/US8888888/en', // URL mismatch
      ipc: 'B25J',
    },
    {
      rank: 3,
      score: 0.90,
      patentId: 'US3001',
      publicationNumber: 'US3001',
      title: 'Zero trust security system (Patent US-7777777)', // Title cross-contamination
      abstract: 'Hardware enclave dynamic token verification.',
      sourceUrl: 'https://patents.google.com/patent/US3001/en',
      ipc: 'H04L',
    },
    {
      rank: 4,
      score: 0.85,
      patentId: 'US4001',
      publicationNumber: 'US4001',
      title: 'Battery management controller',
      abstract: 'Thermal runaway prevention system referencing US-6666666.', // Abstract cross-contamination
      sourceUrl: 'https://patents.google.com/patent/US4001/en',
      ipc: 'H01M',
    },
    {
      rank: 5,
      score: 0.80,
      patentId: '', // Missing ID
      publicationNumber: 'US5001',
      title: 'GaN driver circuit',
      abstract: 'Gallium Nitride gate drive.',
      sourceUrl: 'https://patents.google.com/patent/US5001/en',
      ipc: 'H03K',
    },
  ];

  let mismatchesCaught = 0;
  for (const item of syntheticMismatches) {
    const audit = validator.validateResult(item);
    if (!audit.isValid) {
      mismatchesCaught++;
    }
  }

  const filteredMismatches = validator.validateAndFilterResults(syntheticMismatches, { strictMode: true, logViolations: false });
  console.log(` -> Mismatch Detection Results: ${mismatchesCaught}/${syntheticMismatches.length} Mismatches Caught & Rejected`);
  console.log(` -> Filtered Mismatch Count in Output: ${filteredMismatches.length} (Expected: 0)\n`);

  // 3. Generate Summary Report JSON
  const auditReportData = {
    timestamp: new Date().toISOString(),
    realPatentsAudited: corpusResults.length,
    realPatentsVerified: corpusPassed,
    realPatentsCorrupted: corpusFailed,
    provenancePassRate: `${((corpusPassed / corpusResults.length) * 100).toFixed(1)}%`,
    mismatchTestsExecuted: syntheticMismatches.length,
    mismatchTestsCaught: mismatchesCaught,
    mismatchRejectionRate: `${((mismatchesCaught / syntheticMismatches.length) * 100).toFixed(1)}%`,
    status: corpusFailed === 0 && mismatchesCaught === syntheticMismatches.length ? 'PASS' : 'FAIL',
  };

  console.log('================================================================');
  console.log(` AUDIT SUMMARY STATUS: ${auditReportData.status}`);
  console.log(` Real Patents Verified: ${auditReportData.realPatentsVerified}/${auditReportData.realPatentsAudited} (${auditReportData.provenancePassRate})`);
  console.log(` Mismatches Rejection Rate: ${auditReportData.mismatchRejectionRate}`);
  console.log('================================================================\n');

  const jsonOutPath = path.join(process.cwd(), 'tests', 'evaluation', 'provenance_audit_summary.json');
  fs.writeFileSync(jsonOutPath, JSON.stringify(auditReportData, null, 2));
  console.log(`[✔] Provenance audit summary written to ${jsonOutPath}`);
}

runProvenanceAudit().catch((err) => {
  console.error('[!] Provenance audit runner failed:', err);
  process.exit(1);
});
