import type { ExtractedFeatureInput, NoveltyMatrixResult } from '../interfaces/novelty-matrix.interface.js';
export declare class NoveltyMatrixPromptBuilder {
    static getSystemPrompt(): string;
    static buildPrompt(features: ExtractedFeatureInput[], patents: Array<{
        patentId: string;
        title: string;
        abstract: string;
        claims?: string | undefined;
        ipc?: string | undefined;
        score?: number | undefined;
    }>): string;
    static parseLLMResponse(llmOutput: string, features: ExtractedFeatureInput[], patents: Array<{
        patentId: string;
        title: string;
        abstract: string;
        claims?: string | undefined;
        ipc?: string | undefined;
        score?: number | undefined;
    }>): NoveltyMatrixResult;
    static createHeuristicFallback(features: ExtractedFeatureInput[], patents: Array<{
        patentId: string;
        title: string;
        abstract: string;
        claims?: string | undefined;
        ipc?: string | undefined;
        score?: number | undefined;
    }>): NoveltyMatrixResult;
    private static normalizeStatus;
    private static normalizeRiskLevel;
}
//# sourceMappingURL=novelty-matrix.prompt.d.ts.map