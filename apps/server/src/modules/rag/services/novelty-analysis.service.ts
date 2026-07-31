import type { INoveltyAnalysisService } from '../interfaces/rag.interface.js';
import type {
  RagAnalysisRequest,
  RagAnalysisResponse,
  NoveltyAnalysisResult,
  RagMetrics,
  RagRetrievedPatent,
} from '../interfaces/rag.interface.js';
import type { ISearchService } from '../../search/interfaces/search.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
import { NoveltyAnalysisPromptBuilder } from '../prompts/novelty-analysis.prompt.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';

export class NoveltyAnalysisService implements INoveltyAnalysisService {
  constructor(
    private readonly searchService: ISearchService,
    private readonly llmProvider: ILLMProvider
  ) {}

  /**
   * Performs grounded 7-section AI novelty analysis using Qwen (Ollama)
   * on Top-K prior-art patents retrieved from SearchService.
   */
  async analyzeNovelty(request: RagAnalysisRequest): Promise<RagAnalysisResponse> {
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

      const fallbackAnalysis = NoveltyAnalysisPromptBuilder.createFallbackResult(
        `No prior-art patents were retrieved matching invention query "${query}".`
      );

      console.log(
        `[NoveltyAnalysisService] Analysis completed (Empty Retrieval) | query="${query}" | count=0 | latency=${totalTimeMs}ms`
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
    const systemPrompt = NoveltyAnalysisPromptBuilder.getSystemPrompt();
    const promptText = NoveltyAnalysisPromptBuilder.buildPrompt(query, results, {
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
    const analysis: NoveltyAnalysisResult = NoveltyAnalysisPromptBuilder.parseNoveltyAnalysisResponse(rawLlmOutput);

    const totalTimeMs = Date.now() - totalStart;
    const metrics: RagMetrics = {
      retrievalTimeMs,
      promptTimeMs,
      llmInferenceTimeMs,
      totalTimeMs,
      retrievedCount: retrievedPatents.length,
    };

    console.log(
      `[NoveltyAnalysisService] Novelty Analysis completed | query="${query}" | retrievedCount=${retrievedPatents.length} | retrievalMs=${retrievalTimeMs}ms | promptMs=${promptTimeMs}ms | llmMs=${llmInferenceTimeMs}ms | totalMs=${totalTimeMs}ms`
    );

    return {
      success: true,
      query,
      retrievedPatents,
      analysis,
      metrics,
    };
  }
}
