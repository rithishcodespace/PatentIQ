import type { DesignAroundResult } from '../interfaces/design-around.interface.js';
import type { ExtractedFeatureInput, PatentNoveltyMatrix } from '../interfaces/novelty-matrix.interface.js';
export declare class DesignAroundPromptBuilder {
    static getSystemPrompt(): string;
    static buildPrompt(features: ExtractedFeatureInput[], matrix?: PatentNoveltyMatrix[] | undefined): string;
    static parseLLMResponse(llmOutput: string, features: ExtractedFeatureInput[], matrix?: PatentNoveltyMatrix[] | undefined): DesignAroundResult;
    static createHeuristicFallback(features: ExtractedFeatureInput[], matrix?: PatentNoveltyMatrix[] | undefined): DesignAroundResult;
    private static normalizeFeasibility;
}
//# sourceMappingURL=design-around.prompt.d.ts.map