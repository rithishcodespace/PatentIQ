import type { ISearchService } from '../../search/interfaces/search.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
import type { IFeatureDeconstructionService } from '../interfaces/rag.interface.js';
import type {
  NoveltyMatrixRequestInput,
  NoveltyMatrixResult,
  ExtractedFeatureInput,
} from '../interfaces/novelty-matrix.interface.js';
import { NoveltyMatrixPromptBuilder } from '../prompts/novelty-matrix.prompt.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';

export class NoveltyMatrixService {
  constructor(
    private readonly searchService: ISearchService,
    private readonly llmProvider: ILLMProvider,
    private readonly featureDeconstructionService?: IFeatureDeconstructionService | undefined
  ) {}

  /**
   * Generates Element-Level Novelty Overlap Matrix comparing features against prior-art patents.
   */
  async generateNoveltyMatrix(input: NoveltyMatrixRequestInput): Promise<NoveltyMatrixResult> {
    const startTime = Date.now();
    const query = (input.query || input.text || '').trim();

    // 1. Resolve Extracted Technical Features
    let features: ExtractedFeatureInput[] = input.features || [];

    if (features.length === 0 && query && this.featureDeconstructionService) {
      try {
        const deconstructionResult = await this.featureDeconstructionService.deconstructInvention(query);
        if (deconstructionResult && Array.isArray(deconstructionResult.extractedFeatures)) {
          features = deconstructionResult.extractedFeatures.map((f) => ({
            id: f.id,
            name: f.name,
            description: f.description,
            category: f.category,
            importance: f.importance,
          }));
        }
      } catch (err: any) {
        console.warn(`[NoveltyMatrixService] Feature deconstruction failed, using fallback keyword extraction: ${err.message}`);
      }
    }

    // Fallback feature extraction if still empty
    if (features.length === 0) {
      if (!query) {
        throw new BadRequestError('Either features array or a valid search query/text is required.');
      }
      features = [
        {
          id: 'F1',
          name: query.slice(0, 50),
          description: query,
          importance: 'CRITICAL',
        },
      ];
    }

    // 2. Retrieve Top-K Prior-Art Patents via Hybrid Search Pipeline
    const topK = input.topK ?? 10;
    const searchResponse = await this.searchService.search({ query, topK });
    const rawPatents = searchResponse.results || [];

    const patents = rawPatents.map((p) => ({
      patentId: p.patentId,
      title: p.title || `Patent ${p.patentId}`,
      abstract: p.abstract || '',
      claims: p.claims || '',
      ipc: p.ipc || '',
      score: p.score,
    }));

    if (patents.length === 0) {
      return {
        overallRiskLevel: 'LOW_RISK',
        noveltyRiskScore: 0,
        executiveRationale: 'No prior art patents were retrieved for the provided query. Unique novelty indicated.',
        matrix: [],
        metrics: {
          executionTimeMs: Date.now() - startTime,
          evaluatedFeaturesCount: features.length,
          evaluatedPatentsCount: 0,
        },
      };
    }

    // 3. Perform Element-Level Novelty Overlap Matrix Analysis via Qwen LLM
    let result: NoveltyMatrixResult;

    try {
      const systemPrompt = NoveltyMatrixPromptBuilder.getSystemPrompt();
      const promptText = NoveltyMatrixPromptBuilder.buildPrompt(features, patents);

      const rawLlmOutput = await this.llmProvider.generateCompletion(promptText, {
        systemPrompt,
        temperature: 0.2,
      });

      result = NoveltyMatrixPromptBuilder.parseLLMResponse(rawLlmOutput, features, patents);
    } catch (err: any) {
      console.warn(`[NoveltyMatrixService] LLM matrix generation failed, invoking heuristic fallback: ${err.message}`);
      result = NoveltyMatrixPromptBuilder.createHeuristicFallback(features, patents);
    }

    const executionTimeMs = Date.now() - startTime;
    result.metrics = {
      executionTimeMs,
      evaluatedFeaturesCount: features.length,
      evaluatedPatentsCount: patents.length,
    };

    return result;
  }
}
