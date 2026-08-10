import { OllamaLLMProvider } from '../../../providers/llm/ollama-llm.provider.js';
import { FeatureDeconstructionPromptBuilder } from '../prompts/feature-deconstruction.prompt.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';
export class FeatureDeconstructionService {
    llmProvider;
    constructor(llmProvider) {
        this.llmProvider = llmProvider || new OllamaLLMProvider();
    }
    /**
     * Deconstructs a plain text invention disclosure into structured technical features.
     */
    async deconstructInvention(input) {
        const rawText = typeof input === 'string' ? input : input.query || input.text || '';
        const trimmed = rawText ? rawText.trim() : '';
        if (!trimmed) {
            throw new BadRequestError('Invention text or query cannot be empty.');
        }
        const systemPrompt = FeatureDeconstructionPromptBuilder.getSystemPrompt();
        const promptText = FeatureDeconstructionPromptBuilder.buildPrompt(trimmed);
        try {
            const rawLlmOutput = await this.llmProvider.generateCompletion(promptText, {
                systemPrompt,
                temperature: 0.2,
            });
            return FeatureDeconstructionPromptBuilder.parseDeconstructionResponse(rawLlmOutput, trimmed);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.warn(`[FeatureDeconstructionService] LLM execution failed, using heuristic fallback: ${msg}`);
            return FeatureDeconstructionPromptBuilder.createFallbackResult(trimmed);
        }
    }
}
//# sourceMappingURL=feature-deconstruction.service.js.map