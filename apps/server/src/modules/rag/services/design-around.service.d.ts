import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
import type { NoveltyMatrixService } from './novelty-matrix.service.js';
import type { IFeatureDeconstructionService } from '../interfaces/rag.interface.js';
import type { DesignAroundRequestInput, DesignAroundResult } from '../interfaces/design-around.interface.js';
export declare class DesignAroundService {
    private readonly noveltyMatrixService;
    private readonly llmProvider;
    private readonly featureDeconstructionService?;
    constructor(noveltyMatrixService: NoveltyMatrixService, llmProvider: ILLMProvider, featureDeconstructionService?: IFeatureDeconstructionService | undefined);
    /**
     * Generates actionable engineering Design-Around R&D recommendations.
     */
    generateDesignAround(input: DesignAroundRequestInput): Promise<DesignAroundResult>;
}
//# sourceMappingURL=design-around.service.d.ts.map