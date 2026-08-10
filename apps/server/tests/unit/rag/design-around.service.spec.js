import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DesignAroundService } from '../../../src/modules/rag/services/design-around.service.js';
import { DesignAroundPromptBuilder } from '../../../src/modules/rag/prompts/design-around.prompt.js';
describe('DesignAroundService Unit Tests', () => {
    let designAroundService;
    let mockNoveltyMatrixService;
    let mockLLMProvider;
    let mockDeconstructionService;
    beforeEach(() => {
        mockNoveltyMatrixService = {
            generateNoveltyMatrix: vi.fn().mockResolvedValue({
                overallRiskLevel: 'HIGH_RISK',
                noveltyRiskScore: 85,
                executiveRationale: 'High overlap detected in optical sensor positioning claims.',
                matrix: [
                    {
                        patentId: 'US-9876543-B2',
                        title: 'Optical Position Sensor Apparatus',
                        ipc: 'G01B 11/00',
                        similarityScore: 0.94,
                        overallPatentOverlapScore: 90,
                        featureOverlaps: [
                            {
                                featureId: 'F1',
                                featureName: 'Optical flow velocity sensor',
                                featureDescription: 'High frequency optical sensing module',
                                status: 'EXACT_MATCH',
                                matchConfidence: 0.95,
                                citationEvidence: '[Claims 1-4]: Optical velocity sensor emitting light beam.',
                                explanation: 'Exact match with prior art claim 1.',
                            },
                        ],
                    },
                ],
            }),
        };
        mockLLMProvider = {
            generateCompletion: vi.fn().mockResolvedValue(JSON.stringify({
                overallStrategy: 'Replace optical sensing components with solid-state ultrasonic transducers to bypass optical claim limitations.',
                recommendations: [
                    {
                        featureId: 'F1',
                        featureName: 'Optical flow velocity sensor',
                        conflictReason: 'Direct overlap with US-9876543-B2 Independent Claim 1 regarding optical velocity sensing.',
                        suggestedModification: 'Switch from optical flow velocity sensor to MEMS ultrasonic Doppler transducer array.',
                        patentabilityBoost: '+40% Novelty Boost',
                        rAndDFeasibility: 'HIGH',
                        targetPriorArtId: 'US-9876543-B2',
                    },
                ],
            })),
        };
        mockDeconstructionService = {
            deconstructInvention: vi.fn().mockResolvedValue({
                coreTitle: 'Smart Fluid Flow System',
                technicalDomain: 'G01B',
                extractedFeatures: [
                    {
                        id: 'F1',
                        name: 'Optical flow velocity sensor',
                        description: 'Optical sensing module',
                    },
                ],
            }),
        };
        designAroundService = new DesignAroundService(mockNoveltyMatrixService, mockLLMProvider, mockDeconstructionService);
    });
    describe('Recommendation Generation', () => {
        it('should generate design-around recommendations with conflictReason, suggestedModification, and patentabilityBoost', async () => {
            const result = await designAroundService.generateDesignAround({
                query: 'Smart fluid flow system with optical flow velocity sensor',
            });
            expect(result.overallStrategy).toBeDefined();
            expect(result.recommendations).toHaveLength(1);
            const rec = result.recommendations[0];
            expect(rec?.featureId).toBe('F1');
            expect(rec?.conflictReason).toContain('US-9876543-B2');
            expect(rec?.suggestedModification).toContain('ultrasonic Doppler');
            expect(rec?.patentabilityBoost).toBe('+40% Novelty Boost');
            expect(rec?.rAndDFeasibility).toBe('HIGH');
        });
        it('should trigger heuristic fallback engine when LLM output fails', async () => {
            mockLLMProvider.generateCompletion.mockResolvedValueOnce('INVALID LLM RESPONSE');
            const result = await designAroundService.generateDesignAround({
                query: 'Wireless optical sensor battery charger',
                features: [
                    {
                        id: 'F1',
                        name: 'Optical sensor module',
                        description: 'Light detection array',
                    },
                ],
            });
            expect(result.recommendations).toHaveLength(1);
            expect(result.recommendations[0]?.suggestedModification).toContain('MEMS ultrasonic Doppler');
            expect(result.recommendations[0]?.patentabilityBoost).toBeDefined();
        });
        it('should handle empty input query gracefully by throwing BadRequestError', async () => {
            await expect(designAroundService.generateDesignAround({ query: '' })).rejects.toThrow();
        });
    });
    describe('DesignAroundPromptBuilder Unit Tests', () => {
        it('should generate heuristic recommendations based on technical feature keywords', () => {
            const fallback = DesignAroundPromptBuilder.createHeuristicFallback([
                { id: 'F1', name: 'wireless Bluetooth receiver', description: 'data transmission' },
                { id: 'F2', name: 'lithium battery charger', description: 'power pack' },
            ], [{ patentId: 'US-100', title: 'Prior Art System', overallPatentOverlapScore: 80 }]);
            expect(fallback.recommendations).toHaveLength(2);
            expect(fallback.recommendations[0]?.suggestedModification).toContain('mesh protocol');
            expect(fallback.recommendations[1]?.suggestedModification).toContain('resonant multi-frequency');
        });
    });
});
//# sourceMappingURL=design-around.service.spec.js.map