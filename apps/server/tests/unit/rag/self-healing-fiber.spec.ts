import { describe, it, expect } from 'vitest';
import { NoveltyMatrixService } from '../../../src/modules/rag/services/novelty-matrix.service.js';

describe('Self-Healing Underground Fiber-Optic Cable Verification', () => {
  it('Evaluates Self-Healing Fiber-Optic Cable with multi-component technical feature extraction & evidence alignment', async () => {
    const mockSearchService = {
      search: async () => ({
        results: [
          {
            patentId: 'US-9876501',
            title: 'Distributed Optical Time-Domain Reflectometry Sensing Cable',
            abstract: 'Underground fiber-optic cable utilizing backscattered light spectrum for distributed strain and thermal defect sensing along long spans.',
            claims: '1. A fiber optic cable comprising an optical core, a protective sheath, and a distributed optical sensor measuring Rayleigh backscatter to detect strain.',
            score: 0.88,
          },
          {
            patentId: 'US-9876502',
            title: 'Microcapsule Composite Sheath for Polymer Cables',
            abstract: 'Cable sheathing material incorporating polymeric microcapsules containing dicyclopentadiene monomer for autonomous crack healing.',
            claims: '1. A protective polymer jacket containing microcapsules that rupture upon mechanical stress to release liquid monomer.',
            score: 0.82,
          },
          {
            patentId: 'US-9876503',
            title: 'Underground Cable Trench Inspection System',
            abstract: 'Ground-penetrating radar apparatus for mapping subterranean utility lines.',
            claims: '1. A vehicle-mounted radar system detecting underground pipes.',
            score: 0.65,
          },
        ],
      }),
    };

    const noveltyMatrixService = new NoveltyMatrixService(mockSearchService as any, undefined);
    const query = 'Self-Healing Underground Fiber-Optic Cable Using Distributed Optical Sensing and Microcapsule-Based Localized Repair';
    const result = await noveltyMatrixService.generateNoveltyMatrix({ query });

    console.log('\n========================================================================');
    console.log('       SELF-HEALING FIBER-OPTIC CABLE RAG ANALYSIS BREAKDOWN            ');
    console.log('========================================================================');
    console.log(`TOTAL FEATURES        : ${result.featureSummary.total}`);
    console.log(`DIRECT OVERLAP        : ${result.featureSummary.directOverlap}`);
    console.log(`PARTIAL OVERLAP       : ${result.featureSummary.partialOverlap}`);
    console.log(`NOVEL                 : ${result.featureSummary.novel}`);
    console.log(`UNKNOWN               : ${result.featureSummary.unknown}`);
    console.log(`DISTINCT FEATURES     : ${result.metrics.distinctFeatures.length} [${result.metrics.distinctFeatures.join(', ')}]`);
    console.log(`SINGLE-REF COVERAGE   : ${result.metrics.singleReferenceCoverageScore}% (${result.metrics.singleReferenceCoverageLevel})`);
    console.log(`DISTRIBUTED OVERLAP   : ${result.metrics.distributedOverlapScore}% (${result.metrics.distributedOverlapLevel})`);
    console.log(`EVIDENCE CONFIDENCE   : ${result.metrics.evidenceConfidenceLevel}`);
    console.log(`FINAL RISK SCORE      : ${result.noveltyRiskScore}% (${result.overallRiskLevel})`);
    console.log('------------------------------------------------------------------------');
    console.log('3 EXAMPLE FEATURE MATCHES WITH REAL PATENT EVIDENCE:');
    
    const sampleMatches = result.matrix.flatMap((p) =>
      p.featureOverlaps.map((fo) => ({
        patentId: p.patentId,
        featureId: fo.featureId,
        featureName: fo.featureName,
        status: fo.status,
        confidence: fo.matchConfidence,
        citationEvidence: fo.citationEvidence,
        explanation: fo.explanation,
      }))
    ).slice(0, 3);

    console.log(JSON.stringify(sampleMatches, null, 2));
    console.log('========================================================================\n');

    expect(result.featureSummary.total).toBeGreaterThan(0);
    expect(result.metrics.distinctFeatures.length).toEqual(result.featureSummary.novel + result.featureSummary.unknown);
    expect(result.noveltyRiskScore).toBeGreaterThan(0);
  });
});
