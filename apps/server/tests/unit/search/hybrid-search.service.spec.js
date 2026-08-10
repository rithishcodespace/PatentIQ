import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BM25SearchService } from '../../../src/modules/search/services/bm25-search.service.js';
import { RRFRerankerService } from '../../../src/modules/search/services/rrf-reranker.service.js';
import { SearchService } from '../../../src/modules/search/services/search.service.js';
describe('Precision Hybrid Retrieval Pipeline Unit Tests', () => {
    describe('BM25SearchService Unit Tests', () => {
        let bm25Service;
        beforeEach(() => {
            bm25Service = new BM25SearchService();
        });
        it('should tokenize query text and boost technical part numbers & nomenclature', () => {
            const { tokens, technicalBoostMap } = bm25Service.tokenize('UV-C LED 265nm water sterilization apparatus');
            expect(tokens).toContain('uv-c');
            expect(tokens).toContain('led');
            expect(tokens).toContain('265nm');
            expect(tokens).toContain('sterilization');
            // 'apparatus' should be filtered out as a patent stop-word
            expect(tokens).not.toContain('apparatus');
            // Check 2.5x boost multiplier for technical terms
            expect(technicalBoostMap.get('uv-c')).toBe(2.5);
            expect(technicalBoostMap.get('265nm')).toBe(2.5);
            expect(technicalBoostMap.get('led')).toBe(2.5);
        });
        it('should rank documents higher when exact technical terms match', () => {
            const docs = [
                {
                    id: 'doc-1',
                    patentId: 'US-101',
                    title: 'General water purification device',
                    abstract: 'A method and apparatus for liquid filtering using general carbon filters.',
                    ipc: 'C02F 1/00',
                },
                {
                    id: 'doc-2',
                    patentId: 'US-102',
                    title: 'UV-C LED 265nm Sterilization Bottle',
                    abstract: 'Water container featuring high frequency 265nm UV-C LED emitting circuit.',
                    ipc: 'C02F 1/32',
                },
            ];
            const results = bm25Service.rankDocuments('UV-C 265nm LED sterilization', docs);
            expect(results).toHaveLength(2);
            expect(results[0]?.patentId).toBe('US-102');
            expect(results[0]?.bm25Score).toBeGreaterThan(results[1]?.bm25Score || 0);
        });
    });
    describe('RRFRerankerService Unit Tests', () => {
        let rrfReranker;
        beforeEach(() => {
            rrfReranker = new RRFRerankerService(60, 0.6, 0.4);
        });
        it('should fuse dense vector and sparse BM25 results using reciprocal rank fusion', () => {
            const denseResults = [
                {
                    rank: 1,
                    score: 0.95,
                    patentId: 'PAT-001',
                    title: 'Optical flow sensor system',
                    abstract: 'Drone sensor flow.',
                    ipc: 'B64C',
                },
                {
                    rank: 2,
                    score: 0.85,
                    patentId: 'PAT-002',
                    title: 'Sonar altitude meter',
                    abstract: 'Acoustic distance sensor.',
                    ipc: 'G01S',
                },
            ];
            const sparseResults = [
                {
                    id: 'PAT-002',
                    patentId: 'PAT-002',
                    title: 'Sonar altitude meter',
                    abstract: 'Acoustic distance sensor.',
                    ipc: 'G01S',
                    bm25Score: 8.5,
                },
                {
                    id: 'PAT-003',
                    patentId: 'PAT-003',
                    title: 'Radar positioning module',
                    abstract: 'RF radar module.',
                    ipc: 'G01S',
                    bm25Score: 5.2,
                },
            ];
            const fused = rrfReranker.fuseRanks(denseResults, sparseResults, { topK: 10 });
            expect(fused.length).toBe(3);
            // PAT-002 was rank 2 in dense and rank 1 in sparse
            // RRF score for PAT-002 = 0.6/(60+2) + 0.4/(60+1) = 0.009677 + 0.006557 = 0.0162
            // PAT-001 was rank 1 in dense and absent in sparse
            // RRF score for PAT-001 = 0.6/(60+1) = 0.009836
            expect(fused[0]?.patentId).toBe('PAT-002');
            expect(fused[0]?.rank).toBe(1);
        });
    });
    describe('SearchService Hybrid Execution Unit Tests', () => {
        let searchService;
        let mockEmbeddingProvider;
        let mockSearchRepository;
        beforeEach(() => {
            mockEmbeddingProvider = {
                generateEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
            };
            mockSearchRepository = {
                querySimilarity: vi.fn().mockResolvedValue([
                    {
                        id: 'vec-1',
                        score: 0.88,
                        metadata: {
                            patentId: 'US-999',
                            title: 'Inductive wireless charger',
                            abstract: 'Resonant wireless power transfer.',
                            ipc: 'H02J 50/10',
                        },
                    },
                ]),
            };
            const mockCacheProvider = {
                isAvailable: () => false,
                get: vi.fn(),
                set: vi.fn(),
            };
            searchService = new SearchService(mockEmbeddingProvider, mockSearchRepository, undefined, undefined, mockCacheProvider);
        });
        it('should pass IPC metadata filter to Pinecone repository when provided', async () => {
            const response = await searchService.executeSearch('Wireless inductive power charging', 5, { ipc: 'H02J' });
            expect(mockSearchRepository.querySimilarity).toHaveBeenCalledWith([0.1, 0.2, 0.3], 5, { ipc: { $in: ['H02J'] } });
            expect(response.results).toBeDefined();
            expect(response.metrics?.bm25SearchTimeMs).toBeGreaterThanOrEqual(0);
            expect(response.metrics?.rrfRerankTimeMs).toBeGreaterThanOrEqual(0);
        });
    });
});
//# sourceMappingURL=hybrid-search.service.spec.js.map