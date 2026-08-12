import { describe, it, expect } from 'vitest';
import { EvidenceAnalysisService } from '../../../src/modules/rag/services/evidence-analysis.service.js';

describe('EvidenceAnalysisService Unit Tests', () => {
  const mockDeconstructionService: any = {
    deconstructInvention: async (query: string) => ({
      coreTitle: query,
      technicalDomain: ['Robotics'],
      extractedFeatures: [
        { id: 'F1', name: 'Autonomous drone', description: 'UAV navigation framework' },
        { id: 'F2', name: 'Sensor fusion', description: 'Multispectral sensor array' },
      ],
      isFallback: false,
    }),
  };

  const service = new EvidenceAnalysisService(mockDeconstructionService);

  it('should successfully generate evidence analysis matrix and statutory 102/103 risk', async () => {
    const result = await service.analyzeEvidence({
      query: 'Autonomous drone sensor fusion and wireless charging system',
      selectedPatentIds: ['US1001', 'US1005'],
      strictMode: true,
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.query).toContain('Autonomous drone');
    expect(result.evidenceSummary).toBeDefined();
    expect(result.evidenceSummary.confidenceScore).toBeGreaterThan(0);
    expect(result.featureEvidenceMatrix).toBeInstanceOf(Array);
    expect(result.featureEvidenceMatrix.length).toBeGreaterThan(0);

    const firstFeature = result.featureEvidenceMatrix[0];
    expect(firstFeature?.featureId).toBeDefined();
    expect(firstFeature?.featureName).toBeDefined();
    expect(firstFeature?.status).toMatch(/DIRECT_OVERLAP|PARTIAL_OVERLAP|NO_OVERLAP/);

    expect(result.statutoryAnalysis).toBeDefined();
    expect(typeof result.statutoryAnalysis.sec102Anticipation).toBe('boolean');
    expect(typeof result.statutoryAnalysis.sec103Obviousness).toBe('boolean');
  });

  it('should throw BadRequestError if query is missing or empty', async () => {
    await expect(service.analyzeEvidence({ query: '', selectedPatentIds: [] }))
      .rejects.toThrow('Invention query text is required');
  });
});
