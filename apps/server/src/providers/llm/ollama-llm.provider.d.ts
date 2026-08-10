import type { ILLMProvider, LLMCompletionOptions } from './llm-provider.interface.js';
export declare class OllamaLLMProvider implements ILLMProvider {
    private client;
    private defaultModel;
    constructor(baseUrl?: string, model?: string);
    /**
     * Generates text completion using local Ollama model (qwen2.5:3b).
     */
    generateCompletion(prompt: string, options?: LLMCompletionOptions): Promise<string>;
    /**
     * Legacy method for prior art analysis.
     */
    analyzePriorArt(patentText: string, priorArtMatches: any[]): Promise<{
        noveltyScore: number;
        obviousnessScore: number;
        summary: string;
        keyDifferences: string[];
    }>;
}
//# sourceMappingURL=ollama-llm.provider.d.ts.map