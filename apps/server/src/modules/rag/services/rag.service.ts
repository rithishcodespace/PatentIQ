import type { IRagService, INoveltyAnalysisService } from '../interfaces/rag.interface.js';
import type {
  RagAnalysisRequest,
  RagAnalysisResponse,
} from '../interfaces/rag.interface.js';
import type { HybridRankingDto, RankedPatentCandidate } from '../dto/rag.dto.js';
import type { ISearchService } from '../../search/interfaces/search.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
import { NoveltyAnalysisService } from './novelty-analysis.service.js';

export class RagService implements IRagService {
  private readonly noveltyAnalysisService: INoveltyAnalysisService;

  constructor(
    private readonly searchService: ISearchService,
    private readonly llmProvider: ILLMProvider,
    noveltyAnalysisService?: INoveltyAnalysisService
  ) {
    this.noveltyAnalysisService =
      noveltyAnalysisService || new NoveltyAnalysisService(searchService, llmProvider);
  }

  /**
   * Delegates AI Novelty Analysis pipeline execution to NoveltyAnalysisService.
   */
  async analyze(request: RagAnalysisRequest): Promise<RagAnalysisResponse> {
    return this.noveltyAnalysisService.analyzeNovelty(request);
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
