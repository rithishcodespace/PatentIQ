import type { IFeatureDeconstructionService, InventionDeconstructionResult } from '../interfaces/rag.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';
export declare class FeatureDeconstructionService implements IFeatureDeconstructionService {
    private readonly llmProvider;
    constructor(llmProvider?: ILLMProvider);
    /**
     * Deconstructs a plain text invention disclosure into structured technical features.
     */
    deconstructInvention(input: string | {
        query?: string;
        text?: string;
    }): Promise<InventionDeconstructionResult>;
}
//# sourceMappingURL=feature-deconstruction.service.d.ts.map