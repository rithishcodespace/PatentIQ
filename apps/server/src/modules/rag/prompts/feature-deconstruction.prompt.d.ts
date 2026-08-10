import type { InventionDeconstructionResult } from '../interfaces/rag.interface.js';
export declare class FeatureDeconstructionPromptBuilder {
    /**
     * System prompt instructing LLM to act as a patent examiner and extract structured invention features.
     */
    static getSystemPrompt(): string;
    /**
     * Builds prompt payload with user invention text.
     */
    static buildPrompt(inventionText: string): string;
    /**
     * Robust parser converting raw LLM output into InventionDeconstructionResult.
     * Triggers heuristic fallback parser if LLM output cannot be parsed.
     */
    static parseDeconstructionResponse(llmOutput: string, rawInventionText: string): InventionDeconstructionResult;
    /**
     * Heuristic fallback generator when LLM is unavailable or fails to produce JSON.
     */
    static createFallbackResult(rawInventionText: string): InventionDeconstructionResult;
    private static extractFirstSentence;
    private static toStringArray;
}
//# sourceMappingURL=feature-deconstruction.prompt.d.ts.map