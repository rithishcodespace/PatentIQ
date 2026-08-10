import { DesignAroundPromptBuilder } from '../prompts/design-around.prompt.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';
export class DesignAroundService {
    noveltyMatrixService;
    llmProvider;
    featureDeconstructionService;
    constructor(noveltyMatrixService, llmProvider, featureDeconstructionService) {
        this.noveltyMatrixService = noveltyMatrixService;
        this.llmProvider = llmProvider;
        this.featureDeconstructionService = featureDeconstructionService;
    }
    /**
     * Generates actionable engineering Design-Around R&D recommendations.
     */
    async generateDesignAround(input) {
        const startTime = Date.now();
        const query = (input.query || input.text || '').trim();
        // 1. Obtain Novelty Matrix and Features
        let features = (input.features || []).map((f) => ({
            id: f.id,
            name: f.name,
            description: f.description,
        }));
        let matrixData = undefined;
        if (query || features.length > 0) {
            try {
                const matrixResult = await this.noveltyMatrixService.generateNoveltyMatrix({
                    query,
                    features: features.length > 0 ? features : undefined,
                    topK: input.topK ?? 10,
                });
                matrixData = matrixResult.matrix;
                if (features.length === 0 && matrixResult.matrix.length > 0) {
                    // Extract features from matrix
                    const firstPatent = matrixResult.matrix[0];
                    if (firstPatent && firstPatent.featureOverlaps) {
                        features = firstPatent.featureOverlaps.map((fo) => ({
                            id: fo.featureId,
                            name: fo.featureName,
                            description: fo.featureDescription,
                        }));
                    }
                }
            }
            catch (err) {
                console.warn(`[DesignAroundService] Matrix generation failed, proceeding with direct feature evaluation: ${err.message}`);
            }
        }
        // Direct feature deconstruction fallback if still empty
        if (features.length === 0 && query && this.featureDeconstructionService) {
            try {
                const deconstruction = await this.featureDeconstructionService.deconstructInvention(query);
                if (deconstruction && Array.isArray(deconstruction.extractedFeatures)) {
                    features = deconstruction.extractedFeatures.map((f) => ({
                        id: f.id,
                        name: f.name,
                        description: f.description,
                    }));
                }
            }
            catch (err) {
                console.warn(`[DesignAroundService] Feature deconstruction fallback failed: ${err.message}`);
            }
        }
        if (features.length === 0) {
            if (!query) {
                throw new BadRequestError('Either features array or valid query text is required.');
            }
            features = [
                {
                    id: 'F1',
                    name: query.slice(0, 50),
                    description: query,
                },
            ];
        }
        // 2. Invoke Qwen LLM for R&D Design-Around Recommendations
        let result;
        try {
            const systemPrompt = DesignAroundPromptBuilder.getSystemPrompt();
            const promptText = DesignAroundPromptBuilder.buildPrompt(features, matrixData);
            const rawLlmOutput = await this.llmProvider.generateCompletion(promptText, {
                systemPrompt,
                temperature: 0.3,
            });
            result = DesignAroundPromptBuilder.parseLLMResponse(rawLlmOutput, features, matrixData);
        }
        catch (err) {
            console.warn(`[DesignAroundService] LLM recommendation generation failed, invoking heuristic engine: ${err.message}`);
            result = DesignAroundPromptBuilder.createHeuristicFallback(features, matrixData);
        }
        const executionTimeMs = Date.now() - startTime;
        result.metrics = {
            executionTimeMs,
            evaluatedFeaturesCount: features.length,
        };
        return result;
    }
}
//# sourceMappingURL=design-around.service.js.map