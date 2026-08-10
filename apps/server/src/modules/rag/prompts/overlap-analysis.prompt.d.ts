import type { SearchResult } from '../../search/interfaces/search.interface.js';
import type { OverlapAnalysisItem } from '../interfaces/rag.interface.js';
export interface OverlapPromptOptions {
    maxClaimsLength?: number;
    maxPatentsCount?: number;
}
/**
 * Reusable Prompt Builder and Response Parser for Section and Claim Overlap Analysis.
 * Formats user query and retrieved patent context while enforcing anti-hallucination rules.
 */
export declare class OverlapAnalysisPromptBuilder {
    /**
     * System prompt instructing Qwen to act as a patent examiner identifying section & claim overlaps.
     */
    static getSystemPrompt(): string;
    /**
     * Builds prompt payload containing user invention query and formatted prior-art patent details.
     */
    static buildPrompt(userQuery: string, patents: SearchResult[], options?: OverlapPromptOptions): string;
    /**
     * Robust parser converting raw LLM output string into a typed array of OverlapAnalysisItem.
     */
    static parseOverlapAnalysisResponse(llmOutput: string, retrievedPatents: SearchResult[]): OverlapAnalysisItem[];
    /**
     * Helper fallback when parsing fails or context lacks detailed claim data.
     */
    static createFallbackOverlapItems(retrievedPatents: SearchResult[]): OverlapAnalysisItem[];
}
//# sourceMappingURL=overlap-analysis.prompt.d.ts.map