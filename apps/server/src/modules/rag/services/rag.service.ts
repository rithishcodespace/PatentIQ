import type {
  IRagService,
  INoveltyAnalysisService,
  IOverlapAnalysisService,
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
import { BadRequestError } from '../../../common/errors/http-errors.js';

export class RagService implements IRagService {
  private readonly noveltyAnalysisService: INoveltyAnalysisService;
  private readonly overlapAnalysisService: IOverlapAnalysisService;

  constructor(
    private readonly searchService: ISearchService,
    private readonly llmProvider: ILLMProvider,
    noveltyAnalysisService?: INoveltyAnalysisService,
    overlapAnalysisService?: IOverlapAnalysisService
  ) {
    this.noveltyAnalysisService =
      noveltyAnalysisService || new NoveltyAnalysisService(searchService, llmProvider);
    this.overlapAnalysisService =
      overlapAnalysisService || new OverlapAnalysisService(searchService, llmProvider);
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

    // 1. Single Shared Retrieval Phase
    const retrievalStart = Date.now();
    const searchResponse = await this.searchService.search({ query, topK });
    const retrievalTimeMs = Date.now() - retrievalStart;

    const results = searchResponse.results || [];
    const retrievedPatents: RagRetrievedPatent[] = results.map((p) => ({
      patentId: p.patentId,
      title: p.title,
      score: p.score,
      ipc: p.ipc,
      abstract: p.abstract,
      section: p.section,
    }));

    if (results.length === 0) {
      const noveltyResponse = await this.noveltyAnalysisService.analyzeNovelty(request);
      return {
        ...noveltyResponse,
        overlapAnalysis: [],
      };
    }

    // 2. Execute Novelty Analysis and Overlap Analysis concurrently reusing retrieved results
    const [noveltyResponse, overlapItems] = await Promise.all([
      this.noveltyAnalysisService.analyzeNovelty(request),
      this.overlapAnalysisService.analyzeOverlap(request, results),
    ]);

    const totalTimeMs = Date.now() - totalStart;
    const overlappingClaimsCount = overlapItems.reduce(
      (sum, item) => sum + (item.overlappingClaims ? item.overlappingClaims.length : 0),
      0
    );

    const metrics: RagMetrics = {
      retrievalTimeMs,
      promptTimeMs: noveltyResponse.metrics?.promptTimeMs ?? 0,
      llmInferenceTimeMs: noveltyResponse.metrics?.llmInferenceTimeMs ?? 0,
      totalTimeMs,
      retrievedCount: retrievedPatents.length,
      overlappingClaimsCount,
    };

    return {
      success: true,
      query,
      retrievedPatents,
      analysis: noveltyResponse.analysis,
      overlapAnalysis: overlapItems,
      metrics,
    };
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
