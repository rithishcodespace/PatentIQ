import type { SearchResult } from '../../search/interfaces/search.interface.js';
import type { NoveltyAnalysisResult } from '../interfaces/rag.interface.js';
export interface NoveltyPromptOptions {
    maxClaimsLength?: number;
    maxPatentsCount?: number;
}
/**
 * Reusable Prompt Builder and Response Parser for 7-Section AI Patent Novelty Analysis.
 * Formats user query and retrieved patent context safely for LLM context window while enforcing anti-hallucination rules.
 */
export declare class NoveltyAnalysisPromptBuilder {
    /**
     * System prompt instructing Qwen to act as a senior patent examiner with strict anti-hallucination rules.
     */
    static getSystemPrompt(): string;
    /**
     * Builds prompt payload containing user invention query and formatted prior-art patent context.
     */
    static buildPrompt(userQuery: string, patents: SearchResult[], options?: NoveltyPromptOptions): string;
    /**
     * Robust parser converting raw LLM output string into a clean NoveltyAnalysisResult object.
     */
    static parseNoveltyAnalysisResponse(llmOutput: string, defaultNotice?: string): NoveltyAnalysisResult;
    /**
     * Helper utility ensuring string array conversion.
     */
    private static toStringArray;
    /**
     * Helper fallback when no prior art patents are found or processing empty retrieval.
     */
    static createFallbackResult(message: string): NoveltyAnalysisResult;
}
//# sourceMappingURL=novelty-analysis.prompt.d.ts.map