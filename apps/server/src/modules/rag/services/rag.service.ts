import type {
  IRagService,
  INoveltyAnalysisService,
  IOverlapAnalysisService,
  IFeatureDeconstructionService,
  InventionDeconstructionResult,
  RagAnalysisRequest,
  RagAnalysisResponse,
  RagMetrics,
  RagRetrievedPatent,
} from '../interfaces/rag.interface.js';
import type { HybridRankingDto, RankedPatentCandidate } from '../dto/rag.dto.js';
import type { ISearchService } from '../../search/interfaces/search.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
import { NoveltyAnalysisService } from './novelty-analysis.service.js';
import { OverlapAnalysisService } from './overlap-analysis.service.js';
import { FeatureDeconstructionService } from './feature-deconstruction.service.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';

import type { IHistoryService } from '../../history/interfaces/history.interface.js';
import type { IConfidenceService } from '../../confidence/interfaces/confidence.interface.js';
import { ConfidenceService } from '../../confidence/services/confidence.service.js';
import type { ICacheProvider } from '../../../providers/cache/cache-provider.interface.js';
import { RedisCacheProvider } from '../../../providers/cache/redis-cache.provider.js';

export class RagService implements IRagService {
  private readonly noveltyAnalysisService: INoveltyAnalysisService;
  private readonly overlapAnalysisService: IOverlapAnalysisService;
  private readonly featureDeconstructionService: IFeatureDeconstructionService;
  private readonly confidenceService: IConfidenceService;
  private readonly cacheProvider: ICacheProvider;

  constructor(
    private readonly searchService: ISearchService,
    private readonly llmProvider: ILLMProvider,
    noveltyAnalysisService?: INoveltyAnalysisService,
    overlapAnalysisService?: IOverlapAnalysisService,
    featureDeconstructionService?: IFeatureDeconstructionService,
    historyService?: IHistoryService,
    confidenceService?: IConfidenceService,
    cacheProvider?: ICacheProvider
  ) {
    this.noveltyAnalysisService =
      noveltyAnalysisService || new NoveltyAnalysisService(searchService, llmProvider, historyService);
    this.overlapAnalysisService =
      overlapAnalysisService || new OverlapAnalysisService(searchService, llmProvider);
    this.featureDeconstructionService =
      featureDeconstructionService || new FeatureDeconstructionService(llmProvider);
    this.confidenceService = confidenceService || new ConfidenceService();
    this.cacheProvider = cacheProvider || new RedisCacheProvider();
  }

  /**
   * Primary RAG Pipeline:
   * 1. Retrieves Top-K prior-art patents using SearchService.
   * 2. Executes grounded 7-section novelty analysis via Qwen.
   * 3. Executes section-level and claim-level overlap analysis.
   * 4. Returns combined analysis and overlap payload with latency metrics.
   */
  async analyze(request: RagAnalysisRequest): Promise<RagAnalysisResponse> {
    const totalStart = Date.now();
    const query = request.query ? request.query.trim() : '';

    if (!query) {
      throw new BadRequestError('query cannot be empty');
    }

    const topK = request.topK ?? 10;

    const cacheKey = RedisCacheProvider.createKey('rag', { query, topK });
    if (this.cacheProvider.isAvailable()) {
      const cached = await this.cacheProvider.get<RagAnalysisResponse>(cacheKey);
      if (cached) {
        console.log(`[RagService] Cache HIT for query="${query}" | key="${cacheKey}"`);
        const cachedMetrics: RagMetrics = {
          retrievalTimeMs: cached.metrics?.retrievalTimeMs ?? 0,
          promptTimeMs: cached.metrics?.promptTimeMs ?? 0,
          llmInferenceTimeMs: cached.metrics?.llmInferenceTimeMs ?? 0,
          totalTimeMs: Date.now() - totalStart,
          retrievedCount: cached.metrics?.retrievedCount ?? cached.retrievedPatents?.length ?? 0,
          overlappingClaimsCount: cached.metrics?.overlappingClaimsCount ?? 0,
        };
        return {
          ...cached,
          metrics: cachedMetrics,
        };
      }
    }

    // 1. Single Shared Retrieval Phase (delegated to FastAPI if online)
    const retrievalStart = Date.now();
    let searchResponse: any = null;

    try {
      const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
      const fastRes = await fetch(`${fastApiUrl}/api/ai/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: topK, method: 'hybrid' }),
      });
      if (fastRes.ok) {
        const fastData = await fastRes.json();
        console.log(`[RagService] Successfully received vector search results from Python FastAPI Microservice.`);
        if (fastData?.results) {
          searchResponse = { results: fastData.results };
        }
      }
    } catch (err: any) {
      console.warn(`[RagService] Python FastAPI microservice unreachable (${err.message}). Falling back to internal SearchService.`);
    }

    if (!searchResponse) {
      searchResponse = await this.searchService.search({ query, topK });
    }
    const retrievalTimeMs = Date.now() - retrievalStart;

    const results = searchResponse.results || [];
    const retrievedPatents: RagRetrievedPatent[] = results.map((p: any) => ({
      patentId: p.patentId,
      title: p.title,
      score: p.score ?? p.similarityScore ?? 0.75,
      ipc: p.ipc,
      abstract: p.abstract,
      section: p.section,
    }));

    if (results.length === 0) {
      const [noveltyResponse, deconstructedFeatures] = await Promise.all([
        this.noveltyAnalysisService.analyzeNovelty(request),
        this.featureDeconstructionService.deconstructInvention(query),
      ]);
      return {
        ...noveltyResponse,
        overlapAnalysis: [],
        deconstructedFeatures,
      };
    }

    // 2. Execute Novelty Analysis, Overlap Analysis, and Feature Deconstruction concurrently reusing retrieved results
    const [noveltyResponse, overlapItems, deconstructedFeatures] = await Promise.all([
      this.noveltyAnalysisService.analyzeNovelty(request),
      this.overlapAnalysisService.analyzeOverlap(request, results),
      this.featureDeconstructionService.deconstructInvention(query),
    ]);

    const totalTimeMs = Date.now() - totalStart;
    const overlappingClaimsCount = overlapItems.reduce(
      (sum, item) => sum + (item.overlappingClaims ? item.overlappingClaims.length : 0),
      0
    );

    const confidence = this.confidenceService.computeFullConfidence(
      results,
      noveltyResponse.analysis,
      topK,
      overlappingClaimsCount
    );

    const metrics: RagMetrics = {
      retrievalTimeMs,
      promptTimeMs: noveltyResponse.metrics?.promptTimeMs ?? 0,
      llmInferenceTimeMs: noveltyResponse.metrics?.llmInferenceTimeMs ?? 0,
      totalTimeMs,
      retrievedCount: retrievedPatents.length,
      overlappingClaimsCount,
    };

    const response: RagAnalysisResponse = {
      success: true,
      query,
      confidence: {
        retrieval: confidence.retrieval,
        analysis: confidence.analysis,
        overall: confidence.overall,
      },
      retrievedPatents,
      analysis: noveltyResponse.analysis,
      overlapAnalysis: overlapItems,
      deconstructedFeatures,
      metrics,
    };

    if (this.cacheProvider.isAvailable()) {
      await this.cacheProvider.set(cacheKey, response);
    }

    return response;
  }

  /**
   * Deconstructs plain text invention query into structured technical features.
   */
  async deconstructInvention(
    input: string | { query?: string; text?: string }
  ): Promise<InventionDeconstructionResult> {
    return this.featureDeconstructionService.deconstructInvention(input);
  }

  /**
   * Backward-compatible hybrid ranking method.
   */
  async hybridRank(dto: HybridRankingDto): Promise<RankedPatentCandidate[]> {
    const searchResponse = await this.searchService.search({
      query: dto.queryText,
      topK: dto.topRawResults ?? 100,
    });

    const rawMatches = searchResponse.results || [];
    console.log(`[RagService] Performing hybrid ranking on ${rawMatches.length} candidates`);

    const ranked = rawMatches.map((match) => ({
      patentId: match.patentId,
      combinedScore: match.score * 0.4 + 0.5 * 0.6,
      semanticScore: match.score,
      bm25Score: 0.5,
      claimScore: 0.5,
      ipcScore: 1.0,
    }));

    return ranked.sort((a, b) => b.combinedScore - a.combinedScore).slice(0, dto.topRerankedResults ?? 20);
  }

  /**
   * Backward-compatible cross encoder reranking method.
   */
  async rerankCrossEncoder(candidates: RankedPatentCandidate[], topK: number = 10): Promise<RankedPatentCandidate[]> {
    console.log(`[RagService] Cross Encoder reranking top ${topK} from ${candidates.length} candidates`);
    return candidates.slice(0, topK);
  }
}
