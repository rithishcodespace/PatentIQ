import { describe, it, expect } from 'vitest';
import { EvidenceAnalysisService } from '../../../src/modules/rag/services/evidence-analysis.service.js';
import type { IFeatureDeconstructionService } from '../../../src/modules/rag/interfaces/rag.interface.js';

describe('Evidence-Based Prior-Art Analysis API (/api/analyze) Unit Tests', () => {
  const mockDeconstructionService: IFeatureDeconstructionService = {
    deconstructInvention: async (input: string | { query?: string; text?: string }) => {
      const query = typeof input === 'string' ? input : input.query || input.text || '';
      return {
        coreTitle: query,
        technicalDomain: ['Robotics', 'Aeronautics'],
        extractedFeatures: [
          { id: 'F1', name: 'Autonomous aerial vehicle', description: 'UAV framework', category: 'system', importance: 'CRITICAL' },
          { id: 'F2', name: 'LiDAR sensor array', description: 'Obstacle detection array', category: 'sensor', importance: 'HIGH' },
          { id: 'F3', name: 'Inductive wireless power transfer', description: 'Wireless charging coils', category: 'power', importance: 'MEDIUM' },
        ],
        isFallback: false,
      };
    },
  };

  const service = new EvidenceAnalysisService(mockDeconstructionService);

  it('should successfully analyze technical features against a target patent (US1001)', async () => {
    const response = await service.analyzePatentFeatures({
      invention: 'Autonomous aerial vehicle using LiDAR sensor array for navigation',
      patentId: 'US1001',
      sessionId: 'test-session-123',
    });

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.sessionId).toBe('test-session-123');
    expect(response.patent).toBeDefined();
    expect(response.patent.id).toBe('US1001');
    expect(response.patent.sourceUrl).toContain('US1001');

    expect(response.features).toBeInstanceOf(Array);
    expect(response.features.length).toBe(3);

    const f1 = response.features[0];
    expect(f1).toBeDefined();
    expect(f1?.id).toBe('F1');
    expect(f1?.text).toBe('Autonomous aerial vehicle');
    expect(f1?.status).toMatch(/MATCH|PARTIAL_MATCH|NOT_FOUND/);
    expect(f1?.matchStrength).toBeGreaterThan(0);

    if (f1?.status !== 'NOT_FOUND') {
      expect(f1?.evidence).not.toBeNull();
      expect(f1?.evidence?.section).toMatch(/Claim|Abstract|Description/);
      expect(f1?.evidence?.sourceUrl).toBeDefined();
      if (f1?.evidence?.section === 'Claim') {
        expect(f1?.evidence?.claimNumber).toBeTypeOf('number');
      }
    }
  });

  it('should handle custom patent IDs by generating structured fallback prior-art references', async () => {
    const response = await service.analyzePatentFeatures({
      invention: 'Smart solar water purification bottle using UV-C LEDs',
      patentId: 'US9876543',
    });

    expect(response.success).toBe(true);
    expect(response.patent.id).toBe('US9876543');
    expect(response.patent.title).toContain('US9876543');
    expect(response.features.length).toBeGreaterThan(0);
  });

  it('should throw BadRequestError if invention text is missing', async () => {
    await expect(
      service.analyzePatentFeatures({
        invention: '',
        patentId: 'US1001',
      })
    ).rejects.toThrow('Invention disclosure text is required');
  });

  it('should throw BadRequestError if patentId is missing', async () => {
    await expect(
      service.analyzePatentFeatures({
        invention: 'Autonomous aerial vehicle',
        patentId: '',
      })
    ).rejects.toThrow('Target patentId is required');
  });
});
