import { describe, it, expect } from 'vitest';
import { NoveltyMatrixService } from '../../../src/modules/rag/services/novelty-matrix.service.js';

describe('RAG Pipeline Invariants & Edge Case Suite', () => {
  it('CASE A: All features NOVEL yields zero overlap, LOW risk (5%), and distinctFeatures = total features', async () => {
    const mockSearchService = {
      search: async () => ({
        results: [
          { patentId: 'US-1000', title: 'Unrelated Machinery Patent', abstract: 'Steam turbine cooling mechanism.', claims: 'A valve assembly for steam turbines.' },
          { patentId: 'US-1001', title: 'Hydraulic Brake System', abstract: 'Fluid pressure control valve.', claims: 'Brake pedal sensor assembly.' },
        ],
      }),
    };

    const service = new NoveltyMatrixService(mockSearchService as any, undefined);
    const result = await service.generateNoveltyMatrix({ query: 'Quantum Photonic Crystal Qubit Gate' });

    expect(result.featureSummary.directOverlap).toBe(0);
    expect(result.featureSummary.partialOverlap).toBe(0);
    expect(result.metrics.distributedOverlapScore).toBe(0);
    expect(result.metrics.singleReferenceCoverageScore).toBe(0);
    expect(result.noveltyRiskScore).toBe(5);
    expect(result.overallRiskLevel).toBe('LOW_RISK');
    expect(result.metrics.distinctFeatures.length).toEqual(result.extractedFeatures.length);
    expect(result.featureSummary.novel).toEqual(result.extractedFeatures.length);
  });

  it('CASE B: Direct matches increase directOverlap and risk score', async () => {
    const mockSearchService = {
      search: async () => ({
        results: [
          { patentId: 'US-2000', title: 'Quantum Photonic Gate', abstract: 'A quantum photonic crystal qubit gate for optical computing.', claims: 'A quantum photonic crystal qubit gate comprising optical waveguides.' },
        ],
      }),
    };

    const service = new NoveltyMatrixService(mockSearchService as any, undefined);
    const result = await service.generateNoveltyMatrix({ query: 'Quantum Photonic Crystal Qubit Gate' });

    expect(result.featureSummary.directOverlap).toBeGreaterThan(0);
    expect(result.metrics.distributedOverlapScore).toBeGreaterThan(0);
    expect(result.noveltyRiskScore).toBeGreaterThan(10);
  });

  it('CASE C: One patent covering multiple features increases singleReferenceCoverage', async () => {
    const mockSearchService = {
      search: async () => ({
        results: [
          { patentId: 'US-3000', title: 'Full Fiber Optic System', abstract: 'Self-healing fiber-optic cable with optical sensing and microcapsules.', claims: 'A self-healing fiber optic cable with distributed optical sensing and microcapsule localized repair.' },
        ],
      }),
    };

    const service = new NoveltyMatrixService(mockSearchService as any, undefined);
    const result = await service.generateNoveltyMatrix({ query: 'Self-Healing Fiber Optic Cable' });

    expect(result.metrics.singleReferenceCoverageScore).toBeGreaterThan(40);
    expect(result.matrix[0].weightedCoverage).toBeGreaterThan(40);
  });

  it('CASE D: Distributed patents covering different features yields high distributed overlap but lower single-reference', async () => {
    const mockSearchService = {
      search: async () => ({
        results: [
          { patentId: 'US-4000', title: 'Optical Sensing Only', abstract: 'Distributed optical sensing for underground cables.', claims: 'Optical fiber sensor.' },
          { patentId: 'US-4001', title: 'Microcapsule Repair Only', abstract: 'Microcapsule-based localized repair material.', claims: 'Polymeric microcapsules for repair.' },
        ],
      }),
    };

    const service = new NoveltyMatrixService(mockSearchService as any, undefined);
    const result = await service.generateNoveltyMatrix({ query: 'Optical Sensing and Microcapsule Repair' });

    expect(result.metrics.distributedOverlapScore).toBeGreaterThanOrEqual(result.metrics.singleReferenceCoverageScore);
  });

  it('CASE E: Matrix feature classified as NOVEL is strictly included in distinctFeatures', async () => {
    const mockSearchService = {
      search: async () => ({
        results: [
          { patentId: 'US-5000', title: 'Partial System', abstract: 'Contains optical sensing.', claims: 'Optical sensing claim.' },
        ],
      }),
    };

    const service = new NoveltyMatrixService(mockSearchService as any, undefined);
    const result = await service.generateNoveltyMatrix({ query: 'Optical Sensing with Microcapsule Localized Repair' });

    const novelFeatureIds = result.extractedFeatures
      .filter((f) => result.matrix.every((p) => p.featureOverlaps.some((fo) => fo.featureId === f.id && fo.status === 'NOVEL')))
      .map((f) => f.id);

    novelFeatureIds.forEach((id) => {
      expect(result.metrics.distinctFeatures).toContain(id);
    });
  });
});
