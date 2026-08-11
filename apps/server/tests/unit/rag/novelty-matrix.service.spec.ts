import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoveltyMatrixService } from '../../../src/modules/rag/services/novelty-matrix.service.js';

describe('NoveltyMatrixService Risk Engine Unit Tests', () => {
  let noveltyMatrixService: NoveltyMatrixService;
  let mockSearchService: any;

  beforeEach(() => {
    mockSearchService = {
      search: vi.fn().mockResolvedValue({
        success: true,
        query: 'Test Invention',
        count: 2,
        results: [
          {
            patentId: 'US-101',
            title: 'Prior Art Patent 101',
            abstract: 'Abstract covering basic features',
            claims: 'Claims reciting system implementation',
            score: 0.85,
          },
          {
            patentId: 'US-102',
            title: 'Prior Art Patent 102',
            abstract: 'Abstract covering secondary features',
            claims: 'Claims reciting secondary mechanisms',
            score: 0.75,
          },
        ],
      }),
    };

    noveltyMatrixService = new NoveltyMatrixService(mockSearchService);
  });

  describe('Benchmark Test Cases 1-4', () => {
    it('CASE 1: 10 Features, 0 Direct, 0 Partial, 10 Novel -> LOW Risk', async () => {
      mockSearchService.search.mockResolvedValueOnce({
        success: true,
        query: 'Quantum Teleportation Sensor',
        count: 0,
        results: [],
      });

      const result = await noveltyMatrixService.generateNoveltyMatrix({
        query: 'Quantum Teleportation Sensor',
      });

      expect(result.overallRiskLevel).toBe('LOW_RISK');
      expect(result.noveltyRiskScore).toBeLessThan(25);
      expect(result.metrics.distinctFeatures.length).toBeGreaterThan(0);
      expect(result.metrics.singleReferenceCoverageScore).toBe(0);
      expect(result.metrics.distributedOverlapScore).toBe(0);
    });

    it('CASE 2: 10 Features with Mixed Overlap -> MODERATE or LOW Risk', async () => {
      const result = await noveltyMatrixService.generateNoveltyMatrix({
        query: 'Facial recognition attendance system with CNN feature vectors',
      });

      expect(['LOW_RISK', 'MODERATE_RISK']).toContain(result.overallRiskLevel);
      expect(result.metrics.scoreBreakdown).toBeDefined();
      expect(result.metrics.scoreBreakdown.singleReferenceContribution).toBeGreaterThanOrEqual(0);
      expect(result.metrics.scoreBreakdown.distributedOverlapContribution).toBeGreaterThanOrEqual(0);
    });

    it('CASE 3: High Direct Overlap -> HIGH Risk', async () => {
      mockSearchService.search.mockResolvedValueOnce({
        success: true,
        query: 'Smart Refrigerator',
        count: 5,
        results: [
          {
            patentId: 'US-999',
            title: 'Smart Refrigerator camera food identification temperature humidity sensor door logging weight shelf-life prediction inventory expiration alert shopping dynamic freshness power cache',
            abstract: 'Comprehensive disclosure covering camera food identification, computer vision, temperature, humidity, door logging, weight sensors, shelf-life prediction, digital inventory, expiration alerts, shopping recommendations, thermal spikes, offline cache.',
            claims: 'Claims 1-20: Camera internal food identification, computer vision classification, temperature humidity monitoring, door logging, weight load cells, shelf-life decay modeling, digital food inventory, expiration push alerts, grocery replenishment, dynamic freshness recalculation, power failure cache.',
            score: 0.95,
          },
        ],
      });

      const result = await noveltyMatrixService.generateNoveltyMatrix({
        query: 'Smart Refrigerator with camera food identification and shelf-life prediction',
      });

      expect(result.overallRiskLevel).toBe('HIGH_RISK');
      expect(result.noveltyRiskScore).toBeGreaterThanOrEqual(65);
      expect(result.metrics.singleReferenceCoverageScore).toBeGreaterThan(50);
    });

    it('CASE 4: High Distributed Overlap, Moderate Single-Reference Coverage', async () => {
      // 5 distinct patents each covering 2-3 different features
      mockSearchService.search.mockResolvedValueOnce({
        success: true,
        query: 'Smart Home Energy Management',
        count: 5,
        results: [
          { patentId: 'US-A', title: 'Power Monitor', abstract: 'Continuous household electricity consumption monitoring real-time voltage current', claims: 'electricity monitoring voltage current', score: 0.8 },
          { patentId: 'US-B', title: 'Appliance ID', abstract: 'Non-intrusive appliance identification load consumption signatures baseline modeling', claims: 'appliance identification load signatures', score: 0.8 },
          { patentId: 'US-C', title: 'Demand Prediction', abstract: 'Machine-learning-based energy demand prediction behavioral pattern', claims: 'energy demand prediction behavioral pattern', score: 0.8 },
          { patentId: 'US-D', title: 'Tariff Control', abstract: 'Dynamic electricity tariff cost analysis automated load shedding solid-state switching', claims: 'tariff cost analysis load shedding', score: 0.8 },
          { patentId: 'US-E', title: 'Peak Control', abstract: 'Peak demand power reduction protocol remote telemetry dashboard manual override', claims: 'peak demand reduction telemetry dashboard manual override', score: 0.8 },
        ],
      });

      const result = await noveltyMatrixService.generateNoveltyMatrix({
        query: 'AI-Based Smart Home Energy Management and Appliance Control System',
      });

      // Distributed overlap across corpus is high (covers many features)
      expect(result.metrics.distributedOverlapScore).toBeGreaterThanOrEqual(60);
      // Single-reference coverage for any single patent is lower than distributed overlap
      expect(result.metrics.singleReferenceCoverageScore).toBeLessThanOrEqual(result.metrics.distributedOverlapScore);
      // Final risk score MUST NOT be 2%!
      expect(result.noveltyRiskScore).toBeGreaterThanOrEqual(40);
      expect(result.metrics.scoreBreakdown.singleReferenceContribution).toBeGreaterThan(0);
      expect(result.metrics.scoreBreakdown.distributedOverlapContribution).toBeGreaterThan(0);
    });
  });
});
