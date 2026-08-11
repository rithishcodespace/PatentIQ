import { describe, it, expect, vi } from 'vitest';
import { PatentRerankerService } from '../../../src/modules/search/services/patent-reranker.service.js';
import type { SearchResult } from '../../../src/modules/search/interfaces/search.interface.js';
import type { ILLMProvider } from '../../../src/providers/llm/llm-provider.interface.js';
import { ServiceUnavailableError, GatewayTimeoutError } from '../../../src/common/errors/http-errors.js';

describe('PatentRerankerService Unit Tests', () => {
  const mockQuery = 'Autonomous drone agricultural crop inspection system using multispectral cameras';

  const mockCandidates: SearchResult[] = [
    {
      rank: 1,
      score: 0.0164,
      denseScore: 0.85,
      patentId: 'US1001',
      title: 'UAV Crop Imaging System',
      abstract: 'Unmanned aerial vehicle for agricultural crop health monitoring using cameras.',
      claims: '1. An agricultural inspection drone with multispectral sensor.',
      ipc: 'A01B',
    },
    {
      rank: 2,
      score: 0.0160,
      denseScore: 0.80,
      patentId: 'US1002',
      title: 'Refrigerator Cooling Valve',
      abstract: 'Automatic expansion valve for domestic refrigeration.',
      claims: '1. A cooling valve assembly.',
      ipc: 'F25D',
    },
    {
      rank: 3,
      score: 0.0155,
      denseScore: 0.75,
      patentId: 'US1003',
      title: 'Multispectral Camera Drone',
      abstract: 'Aerial camera system for precision agriculture telemetry.',
      claims: '1. A drone mounted multispectral camera system.',
      ipc: 'A01B',
    },
  ];

  describe('1. Successful Technical Relevance Reranking', () => {
    it('should rerank candidates based on LLM technical relevance evaluations and output sorted results', async () => {
      const mockLlmProvider: ILLMProvider = {
        generateCompletion: vi.fn().mockResolvedValue(JSON.stringify({
          evaluations: [
            { patentId: 'US1001', retrievalRelevanceScore: 0.92, reason: 'Direct technical overlap with agricultural UAV imaging.' },
            { patentId: 'US1002', retrievalRelevanceScore: 0.10, reason: 'Irrelevant domestic refrigeration domain.' },
            { patentId: 'US1003', retrievalRelevanceScore: 0.98, reason: 'High precision match for multispectral drone camera telemetry.' },
          ],
        })),
        analyzePriorArt: vi.fn(),
      };

      const service = new PatentRerankerService(mockLlmProvider, true);
      const result = await service.rerank(mockQuery, mockCandidates, 2);

      expect(result.usedLlmReranker).toBe(true);
      expect(result.rerankedResults.length).toBe(2);

      // Highest relevance score (US1003 with 0.98) should be ranked #1
      expect(result.rerankedResults[0].patentId).toBe('US1003');
      expect(result.rerankedResults[0].rank).toBe(1);
      expect(result.rerankedResults[0].retrievalRelevanceScore).toBe(0.98);

      // Second highest relevance score (US1001 with 0.92) should be ranked #2
      expect(result.rerankedResults[1].patentId).toBe('US1001');
      expect(result.rerankedResults[1].rank).toBe(2);
      expect(result.rerankedResults[1].retrievalRelevanceScore).toBe(0.92);

      // Verify prompt enforced technical relevance only
      const promptArg = (mockLlmProvider.generateCompletion as any).mock.calls[0][1]?.systemPrompt;
      expect(promptArg).toContain('technical relevance');
      expect(promptArg).toContain('Do NOT perform novelty analysis');
    });
  });

  describe('2. Fallback Behavior on LLM Service Failures', () => {
    it('should fall back to original RRF order when LLM throws ServiceUnavailableError', async () => {
      const mockLlmProvider: ILLMProvider = {
        generateCompletion: vi.fn().mockRejectedValue(new ServiceUnavailableError('Ollama service offline')),
        analyzePriorArt: vi.fn(),
      };

      const service = new PatentRerankerService(mockLlmProvider, true);
      const result = await service.rerank(mockQuery, mockCandidates, 2);

      expect(result.usedLlmReranker).toBe(false);
      expect(result.rerankedResults.length).toBe(2);
      expect(result.rerankedResults[0].patentId).toBe('US1001'); // original RRF rank 1
      expect(result.rerankedResults[1].patentId).toBe('US1002'); // original RRF rank 2
      expect(result.rerankedResults[0].relevanceReason).toContain('fallback');
    });

    it('should fall back to original RRF order when LLM throws GatewayTimeoutError', async () => {
      const mockLlmProvider: ILLMProvider = {
        generateCompletion: vi.fn().mockRejectedValue(new GatewayTimeoutError('LLM request timed out')),
        analyzePriorArt: vi.fn(),
      };

      const service = new PatentRerankerService(mockLlmProvider, true);
      const result = await service.rerank(mockQuery, mockCandidates, 3);

      expect(result.usedLlmReranker).toBe(false);
      expect(result.rerankedResults.length).toBe(3);
      expect(result.rerankedResults[0].patentId).toBe('US1001');
    });

    it('should fall back to RRF order when LLM returns malformed or non-JSON output', async () => {
      const mockLlmProvider: ILLMProvider = {
        generateCompletion: vi.fn().mockResolvedValue('Plain text response without valid JSON'),
        analyzePriorArt: vi.fn(),
      };

      const service = new PatentRerankerService(mockLlmProvider, true);
      const result = await service.rerank(mockQuery, mockCandidates, 3);

      expect(result.usedLlmReranker).toBe(false);
      expect(result.rerankedResults.length).toBe(3);
      expect(result.rerankedResults[0].patentId).toBe('US1001');
    });

    it('should fall back to RRF order when service is disabled or provider is missing', async () => {
      const serviceDisabled = new PatentRerankerService(undefined, false);
      const result = await serviceDisabled.rerank(mockQuery, mockCandidates, 3);

      expect(result.usedLlmReranker).toBe(false);
      expect(result.rerankedResults.length).toBe(3);
      expect(result.rerankedResults[0].patentId).toBe('US1001');
    });
  });

  describe('3. Score Naming & Empty Inputs Integrity', () => {
    it('should return empty results when candidate array is empty', async () => {
      const service = new PatentRerankerService(undefined, true);
      const result = await service.rerank(mockQuery, [], 10);

      expect(result.usedLlmReranker).toBe(false);
      expect(result.rerankedResults).toEqual([]);
      expect(result.relevanceScores).toEqual([]);
    });

    it('should use retrievalRelevanceScore field and avoid restricted score names', async () => {
      const service = new PatentRerankerService(undefined, false);
      const result = await service.rerank(mockQuery, mockCandidates, 1);

      const topResult = result.rerankedResults[0];
      expect(topResult.retrievalRelevanceScore).toBeDefined();
      expect((topResult as any).noveltyScore).toBeUndefined();
      expect((topResult as any).riskScore).toBeUndefined();
      expect((topResult as any).overlapScore).toBeUndefined();
      expect((topResult as any).patentabilityScore).toBeUndefined();
    });
  });
});
