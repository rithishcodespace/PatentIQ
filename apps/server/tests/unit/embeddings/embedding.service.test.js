import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmbeddingsService } from '../../../src/modules/embeddings/services/embeddings.service.js';
import { BadRequestError, ServiceUnavailableError, InternalServerError } from '../../../src/common/errors/http-errors.js';
describe('EmbeddingsService Unit Tests', () => {
    let embeddingsService;
    let mockEmbeddingProvider;
    const validDocument = {
        title: 'Wireless Charging Drone',
        abstract: 'An autonomous drone with resonant inductive charging.',
        claims: '1. A drone receiver system.',
        keywords: ['wireless', 'drone'],
        fullText: 'Title: Wireless Charging Drone\n\nAbstract:\nAn autonomous drone with resonant inductive charging.\n\nClaims:\n1. A drone receiver system.',
    };
    beforeEach(() => {
        mockEmbeddingProvider = {
            getModelName: vi.fn().mockReturnValue('nomic-embed-text'),
            getDimension: vi.fn().mockReturnValue(768),
            generateEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0.1)),
            generateBatchEmbeddings: vi.fn().mockResolvedValue([
                new Array(768).fill(0.1), // title vector
                new Array(768).fill(0.2), // abstract vector
                new Array(768).fill(0.3), // claims vector
            ]),
        };
        embeddingsService = new EmbeddingsService(mockEmbeddingProvider);
    });
    describe('generatePatentDocumentEmbeddings', () => {
        it('should generate section-wise embeddings and return metadata without throwing', async () => {
            const result = await embeddingsService.generatePatentDocumentEmbeddings(validDocument);
            expect(mockEmbeddingProvider.generateBatchEmbeddings).toHaveBeenCalledWith([
                'Wireless Charging Drone',
                'An autonomous drone with resonant inductive charging.',
                '1. A drone receiver system.',
            ]);
            expect(result.model).toBe('nomic-embed-text');
            expect(result.dimensions).toBe(768);
            expect(result.sections).toEqual(['title', 'abstract', 'claims']);
            expect(result.generatedAt).toBeDefined();
            expect(result.vectors.title).toHaveLength(768);
            expect(result.vectors.abstract).toHaveLength(768);
            expect(result.vectors.claims).toHaveLength(768);
            expect(result.vectors.fullText).toHaveLength(768);
        });
        it('should throw BadRequestError if document is null or undefined', async () => {
            await expect(embeddingsService.generatePatentDocumentEmbeddings(null)).rejects.toThrow(BadRequestError);
        });
        it('should throw BadRequestError if all section texts are empty', async () => {
            const emptyDoc = {
                title: '   ',
                abstract: '',
                claims: '  ',
                keywords: [],
                fullText: '',
            };
            await expect(embeddingsService.generatePatentDocumentEmbeddings(emptyDoc)).rejects.toThrow('contains no valid text sections');
        });
        it('should propagate ServiceUnavailableError when Ollama service is unreachable', async () => {
            mockEmbeddingProvider.generateBatchEmbeddings.mockRejectedValueOnce(new ServiceUnavailableError('Ollama service unavailable'));
            await expect(embeddingsService.generatePatentDocumentEmbeddings(validDocument)).rejects.toThrow(ServiceUnavailableError);
        });
        it('should propagate InternalServerError when Ollama API returns invalid response', async () => {
            mockEmbeddingProvider.generateBatchEmbeddings.mockRejectedValueOnce(new InternalServerError('Received empty response from Ollama'));
            await expect(embeddingsService.generatePatentDocumentEmbeddings(validDocument)).rejects.toThrow(InternalServerError);
        });
    });
});
//# sourceMappingURL=embedding.service.test.js.map