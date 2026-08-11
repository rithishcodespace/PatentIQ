import { describe, it, expect } from 'vitest';
import { BM25SearchService, type BM25DocumentInput } from '../../../src/modules/search/services/bm25-search.service.js';

describe('BM25 Retrieval Component Unit Tests', () => {
  const bm25Service = new BM25SearchService();

  describe('1. Technical Terminology & Phrase Preservation', () => {
    it('should rank patent with exact technical phrase higher than patent with isolated words', () => {
      const docs: BM25DocumentInput[] = [
        {
          id: 'PAT_GENERIC',
          patentId: 'US1001',
          title: 'Generic Fiber Apparatus',
          abstract: 'Optical cable system for distributed strain telemetry.',
        },
        {
          id: 'PAT_EXACT_PHRASE',
          patentId: 'US1002',
          title: 'Underground Fiber Optic Cable Assembly',
          abstract: 'Subterranean telecommunication cable incorporating distributed optical sensing fibers for microcapsule-based repair.',
        },
      ];

      const query = 'distributed optical sensing and microcapsule-based repair';
      const results = bm25Service.rankDocuments(query, docs);

      expect(results.length).toBe(2);
      expect(results[0].patentId).toBe('US1002');
      expect(results[0].rank).toBe(1);
      expect(results[0].bm25Score).toBeGreaterThan(results[1].bm25Score);
    });

    it('should preserve multi-word technical phrases like "phase-change material" and "soil moisture prediction"', () => {
      const docs: BM25DocumentInput[] = [
        {
          id: 'PAT_SOIL',
          patentId: 'US2001',
          title: 'Agricultural Irrigation Controller',
          abstract: 'Smart valve unit featuring soil moisture prediction algorithms.',
        },
        {
          id: 'PAT_PHASE',
          patentId: 'US2002',
          title: 'Thermal Energy Storage Unit',
          abstract: 'Battery enclosure utilizing phase-change material for passive thermal cooling.',
        },
      ];

      const query = 'phase-change material';
      const results = bm25Service.rankDocuments(query, docs);

      expect(results[0].patentId).toBe('US2002');
      expect(results[0].bm25Score).toBeGreaterThan(0);
    });
  });

  describe('2. Generic Words Do Not Dominate Scoring', () => {
    it('should prioritize specific technical terms over generic patent stop-words', () => {
      const docs: BM25DocumentInput[] = [
        {
          id: 'PAT_BOILERPLATE',
          patentId: 'US3001',
          title: 'System and Method for Operating an Apparatus',
          abstract: 'A system comprising a method and an apparatus configured for general operations disclosed herein.',
        },
        {
          id: 'PAT_TECHNICAL',
          patentId: 'US3002',
          title: 'Photovoltaic Solar Inverter',
          abstract: 'Wide-bandgap silicon carbide semiconductor inverter circuit.',
        },
      ];

      const query = 'silicon carbide inverter system method apparatus';
      const results = bm25Service.rankDocuments(query, docs);

      expect(results[0].patentId).toBe('US3002');
      expect(results[0].rank).toBe(1);
    });
  });

  describe('3. Long Queries & Length Normalization', () => {
    it('should normalize document length so verbose disclosures do not artificially overwhelm concise relevant titles', () => {
      const docs: BM25DocumentInput[] = [
        {
          id: 'PAT_SHORT_RELEVANT',
          patentId: 'US4001',
          title: 'LiDAR Telemetry Unit',
          abstract: 'Autonomous vehicle LiDAR telemetry.',
        },
        {
          id: 'PAT_LONG_VERBOSE',
          patentId: 'US4002',
          title: 'Vehicle Auxiliary Infrastructure Assembly',
          abstract: 'A very long disclosure describing wheels, chassis, seats, mirrors, doors, wipers, radio, engine, brakes, exhaust, transmission, steering, suspension, battery, lights, LiDAR, air conditioning, horn, seatbelts, airbags, trunk, dashboard, windows, tires, fenders, bumpers, and gas tank.',
        },
      ];

      const query = 'LiDAR telemetry';
      const results = bm25Service.rankDocuments(query, docs);

      expect(results[0].patentId).toBe('US4001');
      expect(results[0].rank).toBe(1);
    });
  });

  describe('4. Duplicate Patent Handling & Collapse', () => {
    it('should collapse multiple document chunks with the same patentId into a single ranked result', () => {
      const docChunks: BM25DocumentInput[] = [
        {
          id: 'US5001_title',
          patentId: 'US5001',
          title: 'Autonomous Drone Infrastructure Inspection',
          abstract: '',
        },
        {
          id: 'US5001_abstract',
          patentId: 'US5001',
          title: '',
          abstract: 'Airborne quadcopter equipped with thermal sensors for power line inspection.',
        },
        {
          id: 'US5001_claim_c1',
          patentId: 'US5001',
          title: '',
          abstract: '',
          claims: '1. An airborne drone apparatus comprising thermal telemetry...',
        },
        {
          id: 'US5002_title',
          patentId: 'US5002',
          title: 'Unrelated Substation Transformer',
          abstract: 'Electrical grid power monitoring unit.',
        },
      ];

      const query = 'autonomous drone thermal inspection';
      const results = bm25Service.rankDocuments(query, docChunks);

      expect(results.length).toBe(2);
      expect(results[0].patentId).toBe('US5001');
      expect(results[0].rank).toBe(1);
      expect(results[1].patentId).toBe('US5002');
      expect(results[1].rank).toBe(2);
    });
  });
});
