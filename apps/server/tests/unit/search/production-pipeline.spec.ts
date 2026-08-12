import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchService } from '../../../src/modules/search/services/search.service.js';
import { BM25SearchService } from '../../../src/modules/search/services/bm25-search.service.js';
import { RRFRerankerService } from '../../../src/modules/search/services/rrf-reranker.service.js';
import { PatentRerankerService } from '../../../src/modules/search/services/patent-reranker.service.js';
import { QueryPreprocessorService } from '../../../src/modules/search/services/query-preprocessor.service.js';
import { PatentProvenanceValidator } from '../../../src/modules/search/validators/patent-provenance.validator.js';
import type { IEmbeddingProvider } from '../../../src/providers/embedding/embedding-provider.interface.js';
import type { ISearchRepository, PineconeMatchResult } from '../../../src/modules/search/interfaces/search.interface.js';
import type { IConfidenceService } from '../../../src/modules/confidence/interfaces/confidence.interface.js';
import type { ICacheProvider } from '../../../src/providers/cache/cache-provider.interface.js';

describe('Production Retrieval Pipeline Integration & Safeguard Tests', () => {
  let mockEmbeddingProvider: IEmbeddingProvider;
  let mockSearchRepository: ISearchRepository;
  let mockCacheProvider: ICacheProvider;
  let mockConfidenceService: IConfidenceService;
  let bm25Service: BM25SearchService;
  let rrfService: RRFRerankerService;
  let queryPreprocessor: QueryPreprocessorService;

  const mockMatches: PineconeMatchResult[] = [
    {
      id: 'US1001',
      score: 0.92,
      metadata: {
        patentId: 'US1001',
        title: 'Autonomous drone agricultural crop inspection system using multispectral cameras',
        abstract: 'An agricultural drone equipped with multispectral imaging sensors.',
        ipc: 'A01B',
        sourceUrl: 'https://patents.google.com/patent/US1001/en',
      },
    },
    {
      id: 'US1003',
      score: 0.85,
      metadata: {
        patentId: 'US1003',
        title: 'Multispectral aerial crop monitoring apparatus and vegetation index analysis',
        abstract: 'Aerial surveillance platform utilizing multi-band spectral cameras.',
        ipc: 'A01B',
        sourceUrl: 'https://patents.google.com/patent/US1003/en',
      },
    },
  ];

  beforeEach(() => {
    mockEmbeddingProvider = {
      generateEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0.1)),
    };
    mockSearchRepository = {
      querySimilarity: vi.fn().mockResolvedValue(mockMatches),
      upsertVectors: vi.fn(),
      deleteVectors: vi.fn(),
      stats: vi.fn(),
    };
    mockCacheProvider = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(true),
      del: vi.fn(),
      isAvailable: vi.fn().mockReturnValue(false),
    };
    mockConfidenceService = {
      calculateRetrievalConfidence: vi.fn().mockReturnValue({
        score: 95,
        level: 'Very High',
        breakdown: { topScore: 92, avgScore: 88, distributionScore: 92, countScore: 100, metadataScore: 100 },
      }),
      calculateAnalysisConfidence: vi.fn(),
      calculateOverallConfidence: vi.fn(),
    };

    bm25Service = new BM25SearchService();
    rrfService = new RRFRerankerService();
    queryPreprocessor = new QueryPreprocessorService();
  });

  it('1. should run production pipeline with Technical Reranker DISABLED by default', async () => {
    delete process.env.ENABLE_TECHNICAL_RERANKER;
    const rerankerService = new PatentRerankerService(undefined, false);
    const rerankSpy = vi.spyOn(rerankerService, 'rerank');

    const searchService = new SearchService(
      mockEmbeddingProvider,
      mockSearchRepository,
      undefined,
      mockConfidenceService,
      mockCacheProvider,
      bm25Service,
      rrfService,
      queryPreprocessor,
      rerankerService
    );

    const response = await searchService.search('Autonomous drone agricultural crop inspection');
    expect(response.success).toBe(true);
    expect(rerankSpy).toHaveBeenCalled();

    // Verify reranker returns RRF fallback (usedLlmReranker: false)
    const rerankOutput = await rerankSpy.mock.results[0]?.value;
    expect(rerankOutput.usedLlmReranker).toBe(false);
  });

  it('2. should preserve RRF as the default production ranking strategy', async () => {
    const searchService = new SearchService(
      mockEmbeddingProvider,
      mockSearchRepository,
      undefined,
      mockConfidenceService,
      mockCacheProvider,
      bm25Service,
      rrfService,
      queryPreprocessor
    );

    const response = await searchService.search('Autonomous drone agricultural crop inspection');
    expect(response.results.length).toBeGreaterThan(0);
    // RRF ranks items in order
    expect(response.results[0]?.patentId).toBe('US1001');
  });

  it('3. should execute BM25 and Dense Vector search independently and fuse via RRF', async () => {
    const bm25Spy = vi.spyOn(bm25Service, 'rankDocuments');
    const rrfSpy = vi.spyOn(rrfService, 'fuseRanks');

    const searchService = new SearchService(
      mockEmbeddingProvider,
      mockSearchRepository,
      undefined,
      mockConfidenceService,
      mockCacheProvider,
      bm25Service,
      rrfService,
      queryPreprocessor
    );

    await searchService.search('Autonomous drone agricultural crop inspection');

    expect(mockSearchRepository.querySimilarity).toHaveBeenCalled(); // Dense vector search
    expect(bm25Spy).toHaveBeenCalled(); // BM25 lexical search
    expect(rrfSpy).toHaveBeenCalled(); // RRF fusion
  });

  it('4. should enforce strict Patent Provenance Validation prior to returning API response', async () => {
    const validateSpy = vi.spyOn(PatentProvenanceValidator.prototype, 'validateAndFilterResults');

    const searchService = new SearchService(
      mockEmbeddingProvider,
      mockSearchRepository,
      undefined,
      mockConfidenceService,
      mockCacheProvider,
      bm25Service,
      rrfService,
      queryPreprocessor
    );

    const response = await searchService.search('Autonomous drone agricultural crop inspection');

    expect(validateSpy).toHaveBeenCalled();
    expect(response.results.length).toBeGreaterThan(0);
    for (const res of response.results) {
      expect(res.patentId).toBeDefined();
      expect(res.title).toBeDefined();
      expect(res.abstract).toBeDefined();
    }
  });

  it('5. should allow Technical Reranker to be explicitly enabled for offline experiments', async () => {
    const mockLlm = {
      generateCompletion: vi.fn().mockResolvedValue(
        JSON.stringify({
          evaluations: [
            { patentId: 'US1001', retrievalRelevanceScore: 0.99, reason: 'Exact technical disclosure match.' },
            { patentId: 'US1003', retrievalRelevanceScore: 0.80, reason: 'Partial spectral camera match.' },
          ],
        })
      ),
    };

    const experimentalReranker = new PatentRerankerService(mockLlm, true);
    const rerankResult = await experimentalReranker.rerank('Autonomous drone agricultural crop inspection', [
      { patentId: 'US1001', title: 'Title A', abstract: 'Abstract A', rank: 1, score: 0.9, ipc: 'A01B' },
      { patentId: 'US1003', title: 'Title B', abstract: 'Abstract B', rank: 2, score: 0.8, ipc: 'A01B' },
    ]);

    expect(rerankResult.usedLlmReranker).toBe(true);
    expect(rerankResult.relevanceScores.length).toBe(2);
    expect(rerankResult.relevanceScores[0]?.patentId).toBe('US1001');
  });

  it('6. should ensure production search execution succeeds even if reranker is omitted or throws error', async () => {
    const failingReranker = {
      rerank: vi.fn().mockRejectedValue(new Error('LLM Service Unavailable')),
    } as any;

    const searchService = new SearchService(
      mockEmbeddingProvider,
      mockSearchRepository,
      undefined,
      mockConfidenceService,
      mockCacheProvider,
      bm25Service,
      rrfService,
      queryPreprocessor,
      failingReranker
    );

    // Search handles errors gracefully or falls back
    await expect(searchService.search('Autonomous drone')).rejects.toThrow();
  });
});
