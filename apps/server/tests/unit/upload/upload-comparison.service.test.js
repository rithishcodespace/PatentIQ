import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadComparisonService } from '../../../src/modules/upload/services/upload-comparison.service.js';
import { BadRequestError, NotFoundError, InternalServerError } from '../../../src/common/errors/http-errors.js';
describe('UploadComparisonService Unit Tests', () => {
    let service;
    let mockUploadService;
    let mockDocumentProcessorService;
    let mockEmbeddingsService;
    let mockSearchService;
    let mockRagService;
    let mockHistoryService;
    const validDocument = {
        title: 'Wireless Charging Drone',
        abstract: 'An autonomous drone with resonant inductive charging.',
        claims: '1. An autonomous drone comprising a receiver coil.',
        keywords: ['wireless', 'drone', 'inductive'],
        fullText: 'Title: Wireless Charging Drone\n\nAbstract:\nAn autonomous drone with resonant inductive charging.',
    };
    const mockRagResponse = {
        success: true,
        query: 'Wireless Charging Drone',
        confidence: {
            retrieval: { score: 91.6, level: 'High' },
            analysis: { score: 85.0, level: 'High' },
            overall: { score: 88.3, level: 'High' },
        },
        retrievedPatents: [
            {
                patentId: 'US10123456B2',
                title: 'Wireless Power Transfer System',
                score: 0.92,
                ipc: 'H02J 50/10',
                abstract: 'Resonant inductive power transfer for unmanned aerial vehicles.',
            },
            {
                patentId: 'US9876543B1',
                title: 'Autonomous Aerial Charging Base',
                score: 0.85,
                ipc: 'B64U 50/10',
                abstract: 'Base station for charging autonomous aerial platforms.',
            },
        ],
        analysis: {
            summary: 'The invention presents high overlap with prior-art patent US10123456B2.',
            similarPatents: [{ patentId: 'US10123456B2', reason: 'Inductive coil topology' }],
            featureComparison: {
                commonFeatures: ['Inductive receiver coil'],
                uniqueFeatures: ['Integrated rotor arm coil'],
                partialOverlap: ['Resonant frequency tuning'],
            },
            novelAspects: ['Rotor arm integrated coil assembly'],
            overlappingClaims: ['Claim 1 overlaps with US10123456B2 Claim 4'],
            risks: ['Potential patent infringement risk'],
            recommendations: ['Differentiate rotor arm geometry'],
        },
        overlapAnalysis: [
            {
                patentId: 'US10123456B2',
                title: 'Wireless Power Transfer System',
                similarityScore: 0.92,
                relevantSections: [{ section: 'Abstract' }, { section: 'Claims' }],
                overlappingClaims: [{ claimNumber: 1, summary: 'Coil overlap', reason: 'Identical resonant circuit', overlapStrength: 'High' }],
            },
        ],
        metrics: {
            retrievalTimeMs: 45,
            promptTimeMs: 10,
            llmInferenceTimeMs: 120,
            totalTimeMs: 175,
            retrievedCount: 2,
        },
    };
    beforeEach(() => {
        mockUploadService = {
            getMetadata: vi.fn().mockResolvedValue({
                id: 'doc-uuid-123',
                originalFileName: 'patent.pdf',
                mimeType: 'application/pdf',
                size: 1024,
                storagePath: '/mock/path/patent.pdf',
            }),
        };
        mockDocumentProcessorService = {
            processFile: vi.fn().mockResolvedValue(validDocument),
        };
        mockEmbeddingsService = {
            generatePatentDocumentEmbeddings: vi.fn().mockResolvedValue({
                model: 'nomic-embed-text',
                dimensions: 768,
                sections: ['title', 'abstract', 'claims'],
                generatedAt: '2026-08-02T10:00:00.000Z',
                vectors: {},
            }),
        };
        mockSearchService = {
            search: vi.fn(),
        };
        mockRagService = {
            analyze: vi.fn().mockResolvedValue(mockRagResponse),
        };
        mockHistoryService = {
            saveCompleteSearchAndAnalysis: vi.fn().mockResolvedValue({
                id: 'hist-uuid-789',
            }),
        };
        service = new UploadComparisonService(mockUploadService, mockDocumentProcessorService, mockEmbeddingsService, mockSearchService, mockRagService, mockHistoryService);
    });
    it('should execute end-to-end document comparison using inline StandardPatentDocument', async () => {
        const result = await service.compareDocument({
            document: validDocument,
            topK: 10,
        });
        expect(mockEmbeddingsService.generatePatentDocumentEmbeddings).toHaveBeenCalledWith(validDocument);
        expect(mockRagService.analyze).toHaveBeenCalledWith({
            query: validDocument.fullText,
            topK: 10,
        });
        expect(result.success).toBe(true);
        expect(result.document.title).toBe('Wireless Charging Drone');
        expect(result.retrieval.topK).toBe(10);
        expect(result.retrieval.retrievalConfidence).toBe(91.6);
        expect(result.matches).toHaveLength(2);
        expect(result.matches[0]?.rank).toBe(1);
        expect(result.matches[0]?.patentId).toBe('US10123456B2');
        expect(result.matches[0]?.similarityScore).toBe(0.92);
        expect(result.matches[0]?.matchingSections).toEqual(['Abstract', 'Claims']);
        expect(result.analysis.summary).toContain('high overlap');
        expect(result.analysis.novelty).toContain('Rotor arm integrated coil assembly');
        expect(result.analysis.overlappingClaims).toHaveLength(1);
        expect(result.searchHistoryId).toBe('hist-uuid-789');
    });
    it('should throw BadRequestError if neither document nor documentId is provided', async () => {
        await expect(service.compareDocument({})).rejects.toThrow(BadRequestError);
    });
    it('should throw NotFoundError if documentId does not exist', async () => {
        mockUploadService.getMetadata.mockResolvedValueOnce(null);
        await expect(service.compareDocument({ documentId: 'invalid-id' })).rejects.toThrow(NotFoundError);
    });
    it('should propagate embedding generation failure', async () => {
        mockEmbeddingsService.generatePatentDocumentEmbeddings.mockRejectedValueOnce(new InternalServerError('Ollama model error'));
        await expect(service.compareDocument({ document: validDocument })).rejects.toThrow(InternalServerError);
    });
    it('should throw InternalServerError when RAG pipeline analysis fails', async () => {
        mockRagService.analyze.mockRejectedValueOnce(new Error('LLM Service down'));
        await expect(service.compareDocument({ document: validDocument })).rejects.toThrow(InternalServerError);
    });
    it('should handle empty retrieval results gracefully', async () => {
        mockRagService.analyze.mockResolvedValueOnce({
            success: true,
            query: 'Query',
            retrievedPatents: [],
            analysis: {
                summary: 'No prior art patents found.',
                novelAspects: ['Fully novel concept'],
                overlappingClaims: [],
                recommendations: [],
            },
            overlapAnalysis: [],
        });
        const result = await service.compareDocument({ document: validDocument });
        expect(result.success).toBe(true);
        expect(result.matches).toHaveLength(0);
        expect(result.analysis.summary).toContain('No prior art patents found');
    });
});
//# sourceMappingURL=upload-comparison.service.test.js.map