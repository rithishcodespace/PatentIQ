import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoveltyMatrixService } from '../../../src/modules/rag/services/novelty-matrix.service.js';
import { NoveltyMatrixPromptBuilder } from '../../../src/modules/rag/prompts/novelty-matrix.prompt.js';
describe('NoveltyMatrixService Unit Tests', () => {
    let noveltyMatrixService;
    let mockSearchService;
    let mockLLMProvider;
    let mockDeconstructionService;
    const mockRetrievedResults = [
        {
            rank: 1,
            score: 0.92,
            patentId: 'US-101',
            title: 'Resonant wireless power transfer apparatus',
            abstract: 'Inductive power transfer using multi-coil resonant circuit.',
            claims: '1. A wireless power transfer system comprising multi-coil resonators...',
            ipc: 'H02J 50/10',
        },
        {
            rank: 2,
            score: 0.82,
            patentId: 'US-102',
            title: 'Solar battery charging circuit',
            abstract: 'Photovoltaic charge controller for lithium battery packs.',
            claims: '1. A charger circuit comprising solar panels...',
            ipc: 'H02J 7/00',
        },
    ];
    beforeEach(() => {
        mockSearchService = {
            search: vi.fn().mockResolvedValue({
                success: true,
                query: 'Wireless resonant inductive power transfer',
                count: 2,
                results: mockRetrievedResults,
            }),
        };
        mockLLMProvider = {
            generateCompletion: vi.fn().mockResolvedValue(JSON.stringify({
                overallRiskLevel: 'HIGH_RISK',
                noveltyRiskScore: 85,
                executiveRationale: 'High prior-art overlap detected in multi-coil inductive power transfer claims.',
                matrix: [
                    {
                        patentId: 'US-101',
                        title: 'Resonant wireless power transfer apparatus',
                        ipc: 'H02J 50/10',
                        similarityScore: 0.92,
                        overallPatentOverlapScore: 90,
                        featureOverlaps: [
                            {
                                featureId: 'F1',
                                featureName: 'Multi-coil inductive transmitter',
                                featureDescription: 'Primary resonant coils',
                                status: 'EXACT_MATCH',
                                matchConfidence: 0.95,
                                citationEvidence: '[Claims 1-3]: Multi-coil resonators for power transmission.',
                                explanation: 'Direct identity with claimed feature.',
                            },
                        ],
                    },
                ],
            })),
        };
        mockDeconstructionService = {
            deconstructInvention: vi.fn().mockResolvedValue({
                coreTitle: 'Wireless Charger',
                technicalDomain: 'H02J',
                extractedFeatures: [
                    {
                        id: 'F1',
                        name: 'Multi-coil inductive transmitter',
                        description: 'Primary resonant coils for wireless power transfer',
                        importance: 'CRITICAL',
                    },
                ],
            }),
        };
        noveltyMatrixService = new NoveltyMatrixService(mockSearchService, mockLLMProvider, mockDeconstructionService);
    });
    describe('Matrix Generation & LLM Parsing', () => {
        it('should generate feature overlap matrix given explicit features input', async () => {
            const result = await noveltyMatrixService.generateNoveltyMatrix({
                query: 'Wireless charger',
                features: [
                    {
                        id: 'F1',
                        name: 'Multi-coil inductive transmitter',
                        description: 'Primary resonant coils',
                        importance: 'CRITICAL',
                    },
                ],
            });
            expect(result.overallRiskLevel).toBe('HIGH_RISK');
            expect(result.noveltyRiskScore).toBe(85);
            expect(result.matrix).toHaveLength(1);
            expect(result.matrix[0]?.featureOverlaps[0]?.status).toBe('EXACT_MATCH');
            expect(mockSearchService.search).toHaveBeenCalledWith({ query: 'Wireless charger', topK: 10 });
        });
        it('should auto-deconstruct features when features array is omitted', async () => {
            const result = await noveltyMatrixService.generateNoveltyMatrix({
                query: 'Resonant wireless power transfer apparatus',
            });
            expect(mockDeconstructionService.deconstructInvention).toHaveBeenCalledWith('Resonant wireless power transfer apparatus');
            expect(result.matrix).toBeDefined();
        });
        it('should trigger heuristic fallback engine when LLM output is malformed', async () => {
            mockLLMProvider.generateCompletion.mockResolvedValueOnce('INVALID NON-JSON OUTPUT');
            const result = await noveltyMatrixService.generateNoveltyMatrix({
                query: 'Wireless charger',
                features: [
                    {
                        id: 'F1',
                        name: 'Resonant wireless power transfer',
                        description: 'Inductive power transfer',
                        importance: 'CRITICAL',
                    },
                ],
            });
            expect(result.overallRiskLevel).toBeDefined();
            expect(result.matrix).toHaveLength(2);
            expect(result.matrix[0]?.featureOverlaps[0]?.status).toBe('EXACT_MATCH');
        });
        it('should handle empty search results gracefully', async () => {
            mockSearchService.search.mockResolvedValueOnce({ success: true, query: 'Empty', count: 0, results: [] });
            const result = await noveltyMatrixService.generateNoveltyMatrix({
                query: 'Completely unique novel technology 999',
            });
            expect(result.overallRiskLevel).toBe('LOW_RISK');
            expect(result.noveltyRiskScore).toBe(0);
            expect(result.matrix).toHaveLength(0);
        });
    });
    describe('NoveltyMatrixPromptBuilder Unit Tests', () => {
        it('should normalize status codes correctly', () => {
            const fallback = NoveltyMatrixPromptBuilder.createHeuristicFallback([{ id: 'F1', name: 'solar cell', description: 'photovoltaic' }], [{ patentId: 'PAT-1', title: 'Solar cell charger', abstract: 'photovoltaic solar cell charger', score: 0.9 }]);
            expect(fallback.matrix[0]?.featureOverlaps[0]?.status).toBe('EXACT_MATCH');
        });
    });
});
//# sourceMappingURL=novelty-matrix.service.spec.js.map