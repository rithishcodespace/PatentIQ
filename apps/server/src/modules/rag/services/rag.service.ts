import type { IRagService } from '../interfaces/rag-service.interface.js';
import type { HybridRankingDto, RankedPatentCandidate } from '../dto/rag.dto.js';
import type { ISearchService } from '../../search/interfaces/search-service.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';

export class RagService implements IRagService {
  constructor(
    private readonly searchService: ISearchService,
    private readonly _llmProvider: ILLMProvider
  ) {}

  async hybridRank(dto: HybridRankingDto): Promise<RankedPatentCandidate[]> {
    const rawMatches = await this.searchService.searchPriorArt({
      query: dto.queryText,
      topK: dto.topRawResults ?? 100,
    });

    console.log(`[RagService] Performing hybrid ranking on ${rawMatches.length} candidates`);
    const ranked = rawMatches.map((match) => ({
      patentId: match.patentId,
      combinedScore: match.similarityScore * 0.4 + 0.5 * 0.6,
      semanticScore: match.similarityScore,
      bm25Score: 0.5,
      claimScore: 0.5,
      ipcScore: 1.0,
    }));

    return ranked.sort((a, b) => b.combinedScore - a.combinedScore).slice(0, dto.topRerankedResults ?? 20);
  }

  async rerankCrossEncoder(candidates: RankedPatentCandidate[], topK: number = 10): Promise<RankedPatentCandidate[]> {
    console.log(`[RagService] TODO: Cross Encoder reranking top ${topK} from ${candidates.length} candidates`);
    return candidates.slice(0, topK);
  }
}
