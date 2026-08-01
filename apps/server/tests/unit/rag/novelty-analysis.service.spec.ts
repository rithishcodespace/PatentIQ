import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoveltyAnalysisService } from '../../../src/modules/rag/services/novelty-analysis.service.js';
import { BadRequestError, ServiceUnavailableError } from '../../../src/common/errors/http-errors.js';
import { mockSearchQuery, mockSearchResults } from '../../fixtures/search.fixtures.js';
import { mockLLMRawResponse } from '../../fixtures/rag.fixtures.js';

describe('NoveltyAnalysisService Unit Tests', () => {
  let noveltyAnalysisService: NoveltyAnalysisService;
  let mockSearchService: any;
  let mockLLMProvider: any;
  let mockHistoryService: any;

  beforeEach(() => {
    mockSearchService = {
      search: vi.fn().mockResolvedValue({
        success: true,
        query: mockSearchQuery,
        results: mockSearchResults,
        searchHistoryId: 'history-uuid-123',
      }),
    };

    mockLLMProvider = {
      generateCompletion: vi.fn().mockResolvedValue(mockLLMRawResponse),
    };

    mockHistoryService = {
      findReusableAnalysis: vi.fn().mockResolvedValue(null),
      saveSearchAndAnalysisAtomically: vi.fn().mockResolvedValue({ id: 'history-uuid-123' }),
    };

    noveltyAnalysisService = new NoveltyAnalysisService(
      mockSearchService,
      mockLLMProvider,
      mockHistoryService
    );
  });

  describe('Query & Request Validation', () => {
    it('should throw BadRequestError if query is empty or whitespace', async () => {
      await expect(noveltyAnalysisService.analyzeNovelty({ query: '' })).rejects.toThrow(BadRequestError);
      await expect(noveltyAnalysisService.analyzeNovelty({ query: '   ' })).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if topK is invalid (< 1 or > 100)', async () => {
      await expect(
        noveltyAnalysisService.analyzeNovelty({ query: mockSearchQuery, topK: 0 })
      ).rejects.toThrow(BadRequestError);

      await expect(
        noveltyAnalysisService.analyzeNovelty({ query: mockSearchQuery, topK: 150 })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('Novelty Analysis Execution & LLM Parsing', () => {
    it('should execute search, construct prompt, call LLM, and format 7-section novelty analysis', async () => {
      const response = await noveltyAnalysisService.analyzeNovelty({
        query: mockSearchQuery,
        topK: 5,
      });

      expect(response.success).toBe(true);
      expect(response.query).toBe(mockSearchQuery);
      expect(response.analysis.summary).toContain('combines LiDAR depth estimation');
      expect(response.analysis.similarPatents).toHaveLength(2);
      expect(response.analysis.featureComparison.commonFeatures).toContain('Optical flow sensor integration');
      expect(response.analysis.novelAspects).toHaveLength(2);
      expect(response.analysis.overlappingClaims).toHaveLength(1);
      expect(response.analysis.recommendations).toHaveLength(1);

      expect(mockSearchService.search).toHaveBeenCalledWith({
        query: mockSearchQuery,
        topK: 5,
        filters: undefined,
      });
      expect(mockLLMProvider.generateCompletion).toHaveBeenCalled();
    });

    it('should check and reuse existing novelty analysis when exact query matches in history', async () => {
      mockHistoryService.findReusableAnalysis.mockResolvedValueOnce({
        id: 'cached-history-id',
        retrievedPatents: [
          {
            patentId: 'US-10112233-B2',
            title: 'Dual-sensor UAV obstacle detection',
            similarityScore: 0.92,
            ipc: 'B64C 39/02',
            country: 'US',
            publicationDate: '2023-05-12',
            owner: 'AeroTech Systems Inc.',
          },
        ],
        noveltyAnalysis: {
          summary: 'Cached summary for duplicate search query.',
          novelty: JSON.stringify({
            similarPatents: [{ patentId: 'US-10112233-B2', reason: 'Cached match' }],
            featureComparison: { commonFeatures: ['Sensor fusion'], uniqueFeatures: [], partialOverlap: [] },
            novelAspects: ['Cached novelty point'],
            risks: ['Low risk'],
          }),
          overlappingClaims: ['Claim 1 overlap'],
          recommendations: ['Cached recommendation'],
        },
      });

      const response = await noveltyAnalysisService.analyzeNovelty({
        query: mockSearchQuery,
      });

      expect(response.success).toBe(true);
      expect(response.analysis.summary).toBe('Cached summary for duplicate search query.');
      expect(mockLLMProvider.generateCompletion).not.toHaveBeenCalled();
    });

    it('should handle empty search results from SearchService gracefully', async () => {
      mockSearchService.search.mockResolvedValueOnce({
        success: true,
        query: mockSearchQuery,
        results: [],
      });

      const response = await noveltyAnalysisService.analyzeNovelty({
        query: mockSearchQuery,
      });

      expect(response.success).toBe(true);
      expect(response.retrievedPatents).toEqual([]);
      expect(response.analysis.summary).toContain('No prior-art patents were retrieved');
      expect(mockLLMProvider.generateCompletion).not.toHaveBeenCalled();
    });

    it('should propagate ServiceUnavailableError when LLM provider fails', async () => {
      mockLLMProvider.generateCompletion.mockRejectedValueOnce(
        new ServiceUnavailableError('Ollama Qwen model unavailable')
      );

      await expect(
        noveltyAnalysisService.analyzeNovelty({ query: mockSearchQuery })
      ).rejects.toThrow(ServiceUnavailableError);
    });
  });
});
