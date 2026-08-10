import { NoveltyMatrixPromptBuilder } from '../prompts/novelty-matrix.prompt.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';
export class NoveltyMatrixService {
    searchService;
    llmProvider;
    featureDeconstructionService;
    constructor(searchService, llmProvider, featureDeconstructionService) {
        this.searchService = searchService;
        this.llmProvider = llmProvider;
        this.featureDeconstructionService = featureDeconstructionService;
    }
    /**
     * Generates Element-Level Novelty Overlap Matrix comparing features against prior-art patents.
     */
    async generateNoveltyMatrix(input) {
        const startTime = Date.now();
        const query = (input.query || input.text || '').trim();
        // 1. Resolve Extracted Technical Features
        let features = input.features || [];
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
            }
            catch (err) {
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
        let result;
        try {
            const systemPrompt = NoveltyMatrixPromptBuilder.getSystemPrompt();
            const promptText = NoveltyMatrixPromptBuilder.buildPrompt(features, patents);
            const rawLlmOutput = await this.llmProvider.generateCompletion(promptText, {
                systemPrompt,
                temperature: 0.2,
            });
            result = NoveltyMatrixPromptBuilder.parseLLMResponse(rawLlmOutput, features, patents);
        }
        catch (err) {
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
//# sourceMappingURL=novelty-matrix.service.js.map