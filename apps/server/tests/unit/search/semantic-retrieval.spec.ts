import { describe, it, expect, vi } from 'vitest';
import { SearchService } from '../../../src/modules/search/services/search.service.js';
import { OllamaEmbeddingProvider } from '../../../src/providers/embedding/ollama-embedding.provider.js';
import type { IEmbeddingProvider } from '../../../src/providers/embedding/embedding-provider.interface.js';
import type { ISearchRepository, PineconeMatchResult } from '../../../src/modules/search/interfaces/search.interface.js';
import { ServiceUnavailableError, GatewayTimeoutError, InternalServerError, BadRequestError } from '../../../src/common/errors/http-errors.js';

describe('Semantic Retrieval Stage & Embedding Provider Unit Tests', () => {
  describe('1. EmbeddingProvider Abstraction & Dimensions', () => {
    it('should report 768 vector dimensions matching Pinecone index configuration', () => {
      const provider = new OllamaEmbeddingProvider();
      expect(provider.getDimension()).toBe(768);
      expect(provider.getModelName()).toBe('nomic-embed-text');
    });

    it('should generate embeddings cleanly via IEmbeddingProvider interface', async () => {
      const mockVector = new Array(768).fill(0.123);
      const mockProvider: IEmbeddingProvider = {
        generateEmbedding: vi.fn().mockResolvedValue(mockVector),
        generateBatchEmbeddings: vi.fn().mockResolvedValue([mockVector]),
        getModelName: () => 'nomic-embed-text',
        getDimension: () => 768,
      };

      const searchService = new SearchService(mockProvider);
      const res = await searchService.generateEmbedding('Autonomous solar panel drone');

      expect(mockProvider.generateEmbedding).toHaveBeenCalledWith('Autonomous solar panel drone');
      expect(res.embedding.length).toBe(768);
      expect(res.durationMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('2. Embedding Failure Error Handling', () => {
    it('should throw ServiceUnavailableError when Ollama service is unreachable (ECONNREFUSED)', async () => {
      const mockProvider: IEmbeddingProvider = {
        generateEmbedding: vi.fn().mockRejectedValue(new Error('fetch failed ECONNREFUSED 127.0.0.1:11434')),
        generateBatchEmbeddings: vi.fn(),
        getModelName: () => 'nomic-embed-text',
        getDimension: () => 768,
      };

      const searchService = new SearchService(mockProvider);

      await expect(searchService.generateEmbedding('Underground fiber sensing')).rejects.toThrow(ServiceUnavailableError);
    });

    it('should throw GatewayTimeoutError when embedding generation times out (ETIMEDOUT)', async () => {
      const mockProvider: IEmbeddingProvider = {
        generateEmbedding: vi.fn().mockRejectedValue(new Error('Connection timed out ETIMEDOUT')),
        generateBatchEmbeddings: vi.fn(),
        getModelName: () => 'nomic-embed-text',
        getDimension: () => 768,
      };

      const searchService = new SearchService(mockProvider);

      await expect(searchService.generateEmbedding('Phase-change material cooling')).rejects.toThrow(GatewayTimeoutError);
    });

    it('should throw BadRequestError for empty search prompt', async () => {
      const mockProvider: IEmbeddingProvider = {
        generateEmbedding: vi.fn(),
        generateBatchEmbeddings: vi.fn(),
        getModelName: () => 'nomic-embed-text',
        getDimension: () => 768,
      };

      const searchService = new SearchService(mockProvider);

      await expect(searchService.generateEmbedding('')).rejects.toThrow(BadRequestError);
    });
  });

  describe('3. Pinecone Vector Search Failure Handling', () => {
    it('should throw InternalServerError when Pinecone vector database query fails', async () => {
      const mockProvider: IEmbeddingProvider = {
        generateEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0.5)),
        generateBatchEmbeddings: vi.fn(),
        getModelName: () => 'nomic-embed-text',
        getDimension: () => 768,
      };

      const mockRepo: ISearchRepository = {
        querySimilarity: vi.fn().mockRejectedValue(new Error('Pinecone API 500 Internal Service Error')),
        upsertVectors: vi.fn(),
        deleteVectors: vi.fn(),
      };

      const searchService = new SearchService(mockProvider, mockRepo);

      await expect(searchService.searchVectors(new Array(768).fill(0.5), 10)).rejects.toThrow(InternalServerError);
    });
  });

  describe('4. Structured Match Output Verification', () => {
    it('should return search results with patentId, rank, score, and denseScore', async () => {
      const mockVector = new Array(768).fill(0.1);
      const mockProvider: IEmbeddingProvider = {
        generateEmbedding: vi.fn().mockResolvedValue(mockVector),
        generateBatchEmbeddings: vi.fn(),
        getModelName: () => 'nomic-embed-text',
        getDimension: () => 768,
      };

      const mockMatches: PineconeMatchResult[] = [
        {
          id: 'US9876543_title_t0',
          score: 0.91234,
          metadata: {
            patentId: 'US9876543',
            publicationNumber: 'US9876543B2',
            title: 'Autonomous Solar Inspection',
            abstract: 'Aerial drone system',
            ipc: 'B64C',
          },
        },
      ];

      const mockRepo: ISearchRepository = {
        querySimilarity: vi.fn().mockResolvedValue(mockMatches),
        upsertVectors: vi.fn(),
        deleteVectors: vi.fn(),
      };

      const searchService = new SearchService(mockProvider, mockRepo);
      const { results } = await searchService.executeSearch('Autonomous solar drone', 10);

      expect(results.length).toBe(1);
      expect(results[0].patentId).toBe('US9876543');
      expect(results[0].rank).toBe(1);
      expect(results[0].score).toBe(0.0164);
      expect(results[0].denseScore).toBe(0.9123);

      // Verify that denseScore is returned without restricted names
      expect((results[0] as any).risk).toBeUndefined();
      expect((results[0] as any).novelty).toBeUndefined();
      expect((results[0] as any).patentability).toBeUndefined();
    });
  });
});
