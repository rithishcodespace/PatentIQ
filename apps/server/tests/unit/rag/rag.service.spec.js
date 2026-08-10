import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RagService } from '../../../src/modules/rag/services/rag.service.js';
import { BadRequestError } from '../../../src/common/errors/http-errors.js';
import { mockSearchQuery, mockSearchResults } from '../../fixtures/search.fixtures.js';
import { mockRagAnalysisResult } from '../../fixtures/rag.fixtures.js';
describe('RagService Unit Tests', () => {
    let ragService;
    let mockSearchService;
    let mockLLMProvider;
    let mockNoveltyAnalysisService;
    let mockOverlapAnalysisService;
    beforeEach(() => {
        mockSearchService = {
            search: vi.fn().mockResolvedValue({
                success: true,
                query: mockSearchQuery,
                results: mockSearchResults,
            }),
        };
        mockLLMProvider = {};
        mockNoveltyAnalysisService = {
            analyzeNovelty: vi.fn().mockResolvedValue(mockRagAnalysisResult),
        };
        mockOverlapAnalysisService = {
            analyzeOverlap: vi.fn().mockResolvedValue([
                {
                    patentId: 'US-10112233-B2',
                    title: 'Dual-sensor UAV obstacle detection system',
                    similarityScore: 0.92,
                    overlappingClaims: [{ claimNumber: 1, summary: 'Sensor fusion claim', overlapStrength: 'High' }],
                },
            ]),
        };
        ragService = new RagService(mockSearchService, mockLLMProvider, mockNoveltyAnalysisService, mockOverlapAnalysisService);
    });
    describe('RAG Analysis Validation & Execution', () => {
        it('should throw BadRequestError if query is empty', async () => {
            await expect(ragService.analyze({ query: '' })).rejects.toThrow(BadRequestError);
            await expect(ragService.analyze({ query: '   ' })).rejects.toThrow(BadRequestError);
        });
        it('should orchestrate novelty analysis and claim overlap analysis', async () => {
            const response = await ragService.analyze({
                query: mockSearchQuery,
                topK: 5,
            });
            expect(response.success).toBe(true);
            expect(response.query).toBe(mockSearchQuery);
            expect(response.analysis).toBeDefined();
            expect(response.overlapAnalysis).toHaveLength(1);
            expect(response.metrics?.totalTimeMs).toBeGreaterThanOrEqual(0);
            expect(mockNoveltyAnalysisService.analyzeNovelty).toHaveBeenCalledWith({
                query: mockSearchQuery,
                topK: 5,
                filters: undefined,
            });
            expect(mockOverlapAnalysisService.analyzeOverlap).toHaveBeenCalled();
        });
        it('should execute hybrid candidate reranking correctly', async () => {
            const ranked = await ragService.hybridRank({
                queryText: mockSearchQuery,
                topRawResults: 10,
                topRerankedResults: 5,
            });
            expect(ranked).toBeDefined();
            expect(ranked.length).toBeGreaterThan(0);
            expect(ranked[0]?.patentId).toBe('US-10112233-B2');
        });
    });
});
//# sourceMappingURL=rag.service.spec.js.map