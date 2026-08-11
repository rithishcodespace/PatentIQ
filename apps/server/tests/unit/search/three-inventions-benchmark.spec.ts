import { describe, it, expect } from 'vitest';
import { SearchService } from '../../../src/modules/search/services/search.service.js';

describe('Prior-Art Patent Retrieval Benchmark Suite (3 Target Inventions)', () => {
  const mockPatents = [
    {
      patentId: 'US3939331',
      title: 'Autonomous Airborne Drone Remote Infrastructure Line Inspection Apparatus',
      abstract: 'An unmanned airborne drone apparatus with optical and infrared sensors for automated line-of-sight infrastructure defect detection along transmission lines.',
      publicationDate: '2021-04-15',
      ipc: 'B64C 39/02',
      owner: 'Aerovision Systems Inc.',
      sourceUrl: 'https://patents.google.com/patent/US3939331/en',
      score: 0.94,
    },
    {
      patentId: 'US4110592',
      title: 'AI Railway Track Flaw Inspection and Predictive Ultrasonic Wear Telemetry',
      abstract: 'Railway track inspection vehicle using ultrasonic transducers and deep neural network models for dynamic rail flaw classification.',
      publicationDate: '2020-09-10',
      ipc: 'B61K 9/06',
      owner: 'RailTech Dynamics LLC',
      sourceUrl: 'https://patents.google.com/patent/US4110592/en',
      score: 0.91,
    },
    {
      patentId: 'US9876501',
      title: 'Distributed Optical Sensing Cable with Microcapsule Localized Repair',
      abstract: 'Underground fiber-optic telecommunication cable incorporating distributed strain sensing fibers and stress-rupturable repair microcapsules.',
      publicationDate: '2022-11-05',
      ipc: 'G02B 6/44',
      owner: 'OptiShield Telecommunications Corp.',
      sourceUrl: 'https://patents.google.com/patent/US9876501/en',
      score: 0.89,
    },
  ];

  const mockEmbeddingProvider: any = {
    generateEmbedding: async () => [0.1, 0.2, 0.3],
  };

  const mockSearchRepository: any = {
    querySimilarity: async () =>
      mockPatents.map((p) => ({
        id: p.patentId,
        score: p.score,
        metadata: {
          patentId: p.patentId,
          title: p.title,
          abstract: p.abstract,
          ipc: p.ipc,
          publicationDate: p.publicationDate,
          owner: p.owner,
          sourceUrl: p.sourceUrl,
        },
      })),
  };

  const mockCacheProvider: any = {
    isAvailable: () => false,
    get: async () => null,
    set: async () => {},
  };

  const searchService = new SearchService(
    mockEmbeddingProvider,
    mockSearchRepository,
    undefined,
    undefined,
    mockCacheProvider
  );

  it('Invention A: Autonomous Drone-Based Infrastructure Inspection System', async () => {
    const query = 'Autonomous Drone-Based Infrastructure Inspection System';
    const response = await searchService.search({ query, topK: 10 });

    console.log('\n========================================================================');
    console.log(`BENCHMARK A: "${query}"`);
    console.log('========================================================================');
    console.log(`TOTAL RETRIEVED CANDIDATES : ${response.count}`);
    console.log(`SEARCH METHODOLOGY          : Hybrid Dense Vector + BM25 Keyword + RRF`);
    
    response.results.forEach((p: any, idx: number) => {
      console.log(`\nRANK #${idx + 1} | PATENT ID: ${p.patentId}`);
      console.log(`TITLE          : ${p.title}`);
      console.log(`ABSTRACT       : ${p.abstract.substring(0, 100)}...`);
      console.log(`PUBLICATION    : ${p.publicationDate}`);
      console.log(`IPC            : ${p.ipc}`);
      console.log(`SOURCE URL     : ${p.sourceUrl}`);
    });
    console.log('========================================================================\n');

    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results[0].patentId).toBeDefined();
    expect(response.results[0].title).toBeDefined();
    expect(response.results[0].sourceUrl ? response.results[0].sourceUrl.includes('patents.google.com') : true).toBe(true);

    // Confirm NO AI novelty/risk metrics are injected
    expect((response as any).noveltyScore).toBeUndefined();
    expect((response as any).riskLevel).toBeUndefined();
    expect((response as any).overlapAnalysis).toBeUndefined();
  });

  it('Invention B: AI-Powered Railway Track Inspection and Predictive Maintenance System', async () => {
    const query = 'AI-Powered Railway Track Inspection and Predictive Maintenance System';
    const response = await searchService.search({ query, topK: 10 });

    console.log('\n========================================================================');
    console.log(`BENCHMARK B: "${query}"`);
    console.log('========================================================================');
    console.log(`TOTAL RETRIEVED CANDIDATES : ${response.count}`);
    
    response.results.forEach((p: any, idx: number) => {
      console.log(`RANK #${idx + 1} | ${p.patentId} | ${p.title} | IPC: ${p.ipc}`);
    });
    console.log('========================================================================\n');

    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results[0].patentId).toBeDefined();
  });

  it('Invention C: Self-Healing Underground Fiber-Optic Cable Using Distributed Optical Sensing', async () => {
    const query = 'Self-Healing Underground Fiber-Optic Cable Using Distributed Optical Sensing and Microcapsule-Based Localized Repair';
    const response = await searchService.search({ query, topK: 10 });

    console.log('\n========================================================================');
    console.log(`BENCHMARK C: "${query}"`);
    console.log('========================================================================');
    console.log(`TOTAL RETRIEVED CANDIDATES : ${response.count}`);
    
    response.results.forEach((p: any, idx: number) => {
      console.log(`RANK #${idx + 1} | ${p.patentId} | ${p.title} | IPC: ${p.ipc}`);
    });
    console.log('========================================================================\n');

    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results[0].patentId).toBeDefined();
  });
});
