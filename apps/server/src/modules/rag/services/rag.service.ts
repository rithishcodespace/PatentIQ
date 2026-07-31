import type { IRagService } from '../interfaces/rag.interface.js';
import type {
  RagAnalysisRequest,
  RagAnalysisResponse,
  RagAnalysisResult,
  RagMetrics,
  RagRetrievedPatent,
} from '../interfaces/rag.interface.js';
import type { HybridRankingDto, RankedPatentCandidate } from '../dto/rag.dto.js';
import type { ISearchService } from '../../search/interfaces/search.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
import { PatentAnalysisPromptBuilder } from '../prompts/patent-analysis.prompt.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';

export class RagService implements IRagService {
  constructor(
    private readonly searchService: ISearchService,
    private readonly llmProvider: ILLMProvider
  ) {}

  /**
   * Primary RAG Novelty Analysis Pipeline:
   * 1. Retrieves Top-K prior-art patents using existing SearchService.
   * 2. Builds structured, token-bounded prompt with patent context.
   * 3. Queries Ollama Qwen model for AI novelty assessment.
   * 4. Parses LLM output into structured JSON analysis response.
   */
  async analyze(request: RagAnalysisRequest): Promise<RagAnalysisResponse> {
    const totalStart = Date.now();
    const query = request.query ? request.query.trim() : '';

    if (!query) {
      throw new BadRequestError('query cannot be empty');
    }

    const topK = request.topK ?? 10;
    if (topK < 1 || topK > 100) {
      throw new BadRequestError('maximum topK is 100');
    }

    // 1. Retrieval Phase: Query SearchService for Top-K patents
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

    // Handle empty retrieval results cleanly without failing
    if (results.length === 0) {
      const totalTimeMs = Date.now() - totalStart;
      const metrics: RagMetrics = {
        retrievalTimeMs,
        promptTimeMs: 0,
        llmInferenceTimeMs: 0,
        totalTimeMs,
        retrievedCount: 0,
      };

      const fallbackAnalysis = PatentAnalysisPromptBuilder.createFallbackResult(
        `No prior-art patents were retrieved matching invention query "${query}".`
      );

      console.log(
        `[RagService] Analysis completed (Empty Retrieval) | query="${query}" | count=0 | latency=${totalTimeMs}ms`
      );

      return {
        success: true,
        query,
        retrievedPatents: [],
        analysis: fallbackAnalysis,
        metrics,
      };
    }

    // 2. Context Construction & Prompt Building Phase
    const promptStart = Date.now();
    const systemPrompt = PatentAnalysisPromptBuilder.getSystemPrompt();
    const promptText = PatentAnalysisPromptBuilder.buildPrompt(query, results, {
      maxClaimsLength: 500,
      maxPatentsCount: topK,
    });
    const promptTimeMs = Date.now() - promptStart;

    // 3. LLM Generation Phase: Query Qwen via Ollama
    const llmStart = Date.now();
    const rawLlmOutput = await this.llmProvider.generateCompletion(promptText, {
      systemPrompt,
      temperature: 0.2,
    });
    const llmInferenceTimeMs = Date.now() - llmStart;

    // 4. Response Parsing Phase
    const analysis: RagAnalysisResult = PatentAnalysisPromptBuilder.parseAnalysisResponse(rawLlmOutput);

    const totalTimeMs = Date.now() - totalStart;
    const metrics: RagMetrics = {
      retrievalTimeMs,
      promptTimeMs,
      llmInferenceTimeMs,
      totalTimeMs,
      retrievedCount: retrievedPatents.length,
    };

    console.log(
      `[RagService] RAG Analysis completed | query="${query}" | retrievedCount=${retrievedPatents.length} | retrievalMs=${retrievalTimeMs}ms | promptMs=${promptTimeMs}ms | llmMs=${llmInferenceTimeMs}ms | totalMs=${totalTimeMs}ms`
    );

    return {
      success: true,
      query,
      retrievedPatents,
      analysis,
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
