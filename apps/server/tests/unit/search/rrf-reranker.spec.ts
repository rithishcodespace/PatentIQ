import { describe, it, expect } from 'vitest';
import { RRFRerankerService } from '../../../src/modules/search/services/rrf-reranker.service.js';
import type { SearchResult, BM25MatchResult } from '../../../src/modules/search/interfaces/search.interface.js';

describe('RRFRerankerService Unit Tests', () => {
  const reranker = new RRFRerankerService(60, 0.6, 0.4);

  describe('1. Patent appears in both lists', () => {
    it('should combine ranks from both dense and BM25 lists for patents present in both', () => {
      const denseResults: SearchResult[] = [
        { rank: 1, score: 0.95, denseScore: 0.95, patentId: 'US1001', title: 'Solar Inverter', abstract: 'Solar inverter system', ipc: 'H02M' },
      ];
      const bm25Results: BM25MatchResult[] = [
        { id: 'US1001', patentId: 'US1001', rank: 1, bm25Score: 12.5, title: 'Solar Inverter', abstract: 'Solar inverter system', ipc: 'H02M' },
      ];

      const results = reranker.fuseRanks(denseResults, bm25Results, { topK: 10 });

      expect(results.length).toBe(1);
      expect(results[0].patentId).toBe('US1001');
      expect(results[0].denseRank).toBe(1);
      expect(results[0].bm25Rank).toBe(1);
      expect(results[0].finalRank).toBe(1);

      // Expected RRF Score: 0.6 / (60 + 1) + 0.4 / (60 + 1) = 1.0 / 61 = 0.0164
      const expectedScore = Number(((0.6 / 61) + (0.4 / 61)).toFixed(4));
      expect(results[0].rrfScore).toBe(expectedScore);
      expect(results[0].score).toBe(expectedScore);
    });
  });

  describe('2. Patent appears only in BM25', () => {
    it('should set denseRank to null and compute RRF score using only BM25 rank', () => {
      const denseResults: SearchResult[] = [];
      const bm25Results: BM25MatchResult[] = [
        { id: 'US2001', patentId: 'US2001', rank: 2, bm25Score: 8.4, title: 'Wind Turbine', abstract: 'Wind energy rotor', ipc: 'F03D' },
      ];

      const results = reranker.fuseRanks(denseResults, bm25Results, { topK: 10 });

      expect(results.length).toBe(1);
      expect(results[0].patentId).toBe('US2001');
      expect(results[0].denseRank).toBeNull();
      expect(results[0].bm25Rank).toBe(2);

      const expectedScore = Number((0.4 / (60 + 2)).toFixed(4));
      expect(results[0].rrfScore).toBe(expectedScore);
    });
  });

  describe('3. Patent appears only in vector search', () => {
    it('should set bm25Rank to null and compute RRF score using only dense rank', () => {
      const denseResults: SearchResult[] = [
        { rank: 3, score: 0.88, denseScore: 0.88, patentId: 'US3001', title: 'Hydro Generator', abstract: 'Water turbine unit', ipc: 'F03B' },
      ];
      const bm25Results: BM25MatchResult[] = [];

      const results = reranker.fuseRanks(denseResults, bm25Results, { topK: 10 });

      expect(results.length).toBe(1);
      expect(results[0].patentId).toBe('US3001');
      expect(results[0].denseRank).toBe(3);
      expect(results[0].bm25Rank).toBeNull();

      const expectedScore = Number((0.6 / (60 + 3)).toFixed(4));
      expect(results[0].rrfScore).toBe(expectedScore);
    });
  });

  describe('4. Duplicate results handling', () => {
    it('should deduplicate multiple entries of the same patentId keeping the best (lowest) rank position', () => {
      const denseResults: SearchResult[] = [
        { rank: 5, score: 0.70, denseScore: 0.70, patentId: 'US4001', title: 'Smart Grid 1', abstract: 'Grid telemetry', ipc: 'H04L' },
        { rank: 1, score: 0.96, denseScore: 0.96, patentId: 'US4001', title: 'Smart Grid 2', abstract: 'Grid telemetry', ipc: 'H04L' },
      ];
      const bm25Results: BM25MatchResult[] = [
        { id: 'US4001_c1', patentId: 'US4001', rank: 3, bm25Score: 10.1, title: 'Smart Grid 3', abstract: 'Grid telemetry', ipc: 'H04L' },
        { id: 'US4001_c2', patentId: 'US4001', rank: 2, bm25Score: 11.2, title: 'Smart Grid 4', abstract: 'Grid telemetry', ipc: 'H04L' },
      ];

      const results = reranker.fuseRanks(denseResults, bm25Results, { topK: 10 });

      expect(results.length).toBe(1);
      expect(results[0].patentId).toBe('US4001');
      expect(results[0].denseRank).toBe(1); // kept lowest 1-based rank
      expect(results[0].bm25Rank).toBe(2);  // kept lowest 1-based rank
    });
  });

  describe('5. Deterministic tie breaking', () => {
    it('should order tied RRF scores deterministically using presence in both lists and patentId', () => {
      // Both patents result in same single-source RRF score with same weight and rank
      const denseResults: SearchResult[] = [
        { rank: 1, score: 0.90, denseScore: 0.90, patentId: 'US_B_PATENT', title: 'Title B', abstract: 'Abs B', ipc: 'A01' },
        { rank: 1, score: 0.90, denseScore: 0.90, patentId: 'US_A_PATENT', title: 'Title A', abstract: 'Abs A', ipc: 'A01' },
      ];
      const bm25Results: BM25MatchResult[] = [];

      const results1 = reranker.fuseRanks(denseResults, bm25Results, { topK: 10 });
      const results2 = reranker.fuseRanks(denseResults, bm25Results, { topK: 10 });

      expect(results1[0].patentId).toBe('US_A_PATENT'); // Lexicographical tie-break
      expect(results1[1].patentId).toBe('US_B_PATENT');
      expect(results1).toEqual(results2); // Deterministic consistency
    });
  });

  describe('6. Empty results handling', () => {
    it('should return an empty array when both inputs are empty or null', () => {
      expect(reranker.fuseRanks([], [])).toEqual([]);
      expect(reranker.fuseRanks(null, undefined)).toEqual([]);
    });
  });

  describe('7. Configurable RRF parameters & topK values', () => {
    it('should respect topK limit and custom weights (vectorWeight, bm25Weight, k)', () => {
      const denseResults: SearchResult[] = [
        { rank: 1, score: 0.9, denseScore: 0.9, patentId: 'US5001', title: 'P1', abstract: 'A1', ipc: 'G06' },
        { rank: 2, score: 0.8, denseScore: 0.8, patentId: 'US5002', title: 'P2', abstract: 'A2', ipc: 'G06' },
        { rank: 3, score: 0.7, denseScore: 0.7, patentId: 'US5003', title: 'P3', abstract: 'A3', ipc: 'G06' },
      ];
      const bm25Results: BM25MatchResult[] = [];

      const results = reranker.rerank({
        denseResults,
        bm25Results,
        topK: 2,
        k: 100,
        vectorWeight: 0.8,
        bm25Weight: 0.2,
      });

      expect(results.length).toBe(2);
      expect(results[0].patentId).toBe('US5001');
      expect(results[0].finalRank).toBe(1);
      expect(results[1].patentId).toBe('US5002');
      expect(results[1].finalRank).toBe(2);

      // Score with k=100, w=0.8: 0.8 / (100 + 1) = 0.0079
      expect(results[0].rrfScore).toBe(Number((0.8 / 101).toFixed(4)));
    });
  });
});
