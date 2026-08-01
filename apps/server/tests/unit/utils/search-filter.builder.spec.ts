import { describe, it, expect } from 'vitest';
import { SearchMapper } from '../../../src/modules/search/mappers/search.mapper.js';
import { mockPineconeMatches } from '../../fixtures/search.fixtures.js';

describe('SearchMapper Utility Unit Tests', () => {
  describe('formatScore', () => {
    it('should format raw numeric similarity score to four decimal places', () => {
      expect(SearchMapper.formatScore(0.9123456)).toBe(0.9123);
      expect(SearchMapper.formatScore(0.85)).toBe(0.85);
      expect(SearchMapper.formatScore(1.0)).toBe(1.0);
    });

    it('should handle null, undefined, or NaN safely returning 0', () => {
      expect(SearchMapper.formatScore(null)).toBe(0);
      expect(SearchMapper.formatScore(undefined)).toBe(0);
      expect(SearchMapper.formatScore(NaN)).toBe(0);
    });
  });

  describe('formatClaims', () => {
    it('should return undefined for empty or missing claims text', () => {
      expect(SearchMapper.formatClaims(undefined)).toBeUndefined();
      expect(SearchMapper.formatClaims('')).toBeUndefined();
      expect(SearchMapper.formatClaims('   ')).toBeUndefined();
    });

    it('should truncate claims text if length exceeds threshold', () => {
      const longClaims = '1. A method for drone navigation comprising sensors... ' + 'A'.repeat(1200);
      const formatted = SearchMapper.formatClaims(longClaims, 100);
      expect(formatted).toContain('... [truncated]');
      expect(formatted?.length).toBeLessThan(150);
    });
  });

  describe('toSearchResultList', () => {
    it('should sort Pinecone match items by score descending and assign 1-based ranks', () => {
      const results = SearchMapper.toSearchResultList(mockPineconeMatches, 10);
      expect(results).toHaveLength(2);
      expect(results[0]?.rank).toBe(1);
      expect(results[0]?.score).toBe(0.92);
      expect(results[1]?.rank).toBe(2);
      expect(results[1]?.score).toBe(0.84);
    });

    it('should handle empty or null matches array gracefully', () => {
      expect(SearchMapper.toSearchResultList([])).toEqual([]);
      expect(SearchMapper.toSearchResultList(null as any)).toEqual([]);
    });
  });
});
