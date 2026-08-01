import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchService } from '../../../src/modules/search/services/search.service.js';
import { BadRequestError, ServiceUnavailableError } from '../../../src/common/errors/http-errors.js';
import {
  mockSearchQuery,
  mockSearchRequest,
  mockVectorEmbedding,
  mockPineconeMatches,
} from '../../fixtures/search.fixtures.js';

describe('SearchService Unit Tests', () => {
  let searchService: SearchService;
  let mockEmbeddingProvider: any;
  let mockSearchRepository: any;
  let mockHistoryService: any;

  beforeEach(() => {
    mockEmbeddingProvider = {
      generateEmbedding: vi.fn().mockResolvedValue(mockVectorEmbedding),
    };

    mockSearchRepository = {
      querySimilarity: vi.fn().mockResolvedValue(mockPineconeMatches),
    };

    mockHistoryService = {
      saveSearchHistory: vi.fn().mockResolvedValue({ id: 'history-uuid-123' }),
    };

    searchService = new SearchService(
      mockEmbeddingProvider,
      mockSearchRepository,
      mockHistoryService
    );
  });

  describe('Query Validation & Embedding Generation', () => {
    it('should throw BadRequestError if search query is empty', async () => {
      await expect(searchService.search({ query: '' })).rejects.toThrow(BadRequestError);
      await expect(searchService.search({ query: '   ' })).rejects.toThrow(BadRequestError);
    });

    it('should generate text vector embedding for valid query', async () => {
      const { embedding, durationMs } = await searchService.generateEmbedding(mockSearchQuery);
      expect(embedding).toEqual(mockVectorEmbedding);
      expect(durationMs).toBeGreaterThanOrEqual(0);
      expect(mockEmbeddingProvider.generateEmbedding).toHaveBeenCalledWith(mockSearchQuery);
    });

    it('should propagate ServiceUnavailableError when Ollama embedding fails', async () => {
      mockEmbeddingProvider.generateEmbedding.mockRejectedValueOnce(
        new ServiceUnavailableError('Ollama service unreachable')
      );

      await expect(searchService.generateEmbedding(mockSearchQuery)).rejects.toThrow(
        ServiceUnavailableError
      );
    });
  });

  describe('Pinecone Search & Ranking', () => {
    it('should invoke Pinecone search with query vector, topK, and filters', async () => {
      const response = await searchService.search(mockSearchRequest);

      expect(response.success).toBe(true);
      expect(response.count).toBe(2);
      expect(response.results).toHaveLength(2);
      expect(response.results[0].rank).toBe(1);
      expect(response.results[0].score).toBe(0.92);
      expect(response.results[0].patentId).toBe('US-10112233-B2');

      expect(mockSearchRepository.querySimilarity).toHaveBeenCalledWith(
        mockVectorEmbedding,
        5
      );
    });

    it('should handle empty Pinecone search results gracefully', async () => {
      mockSearchRepository.querySimilarity.mockResolvedValueOnce([]);

      const response = await searchService.search(mockSearchRequest);

      expect(response.success).toBe(true);
      expect(response.count).toBe(0);
      expect(response.results).toEqual([]);
      expect(response.metrics.totalResults).toBe(0);
    });

    it('should save search history automatically when historyService is injected', async () => {
      const response = await searchService.search(mockSearchRequest);

      expect(mockHistoryService.saveSearchHistory).toHaveBeenCalled();
      expect(response.searchHistoryId).toBe('history-uuid-123');
    });

    it('should continue search successfully even if search history saving fails', async () => {
      mockHistoryService.saveSearchHistory.mockRejectedValueOnce(new Error('DB write failed'));

      const response = await searchService.search(mockSearchRequest);

      expect(response.success).toBe(true);
      expect(response.results).toHaveLength(2);
    });
  });

  describe('Prior Art Candidate Mapping', () => {
    it('should execute prior art candidate retrieval and return mapped candidates', async () => {
      const candidates = await searchService.searchPriorArt(mockSearchRequest);

      expect(candidates).toHaveLength(2);
      expect(candidates[0].patentId).toBe('US-10112233-B2');
      expect(candidates[0].similarityScore).toBe(0.92);
    });
  });
});
