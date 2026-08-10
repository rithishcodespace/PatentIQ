import { OverlapAnalysisPromptBuilder } from '../prompts/overlap-analysis.prompt.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';
export class OverlapAnalysisService {
    searchService;
    llmProvider;
    constructor(searchService, llmProvider) {
        this.searchService = searchService;
        this.llmProvider = llmProvider;
    }
    /**
     * Performs section-level and claim-level overlap analysis between user invention query
     * and Top-K retrieved prior-art patents using Qwen (Ollama).
     */
    async analyzeOverlap(request, searchResults) {
        const totalStart = Date.now();
        const query = request.query ? request.query.trim() : '';
        if (!query) {
            throw new BadRequestError('query cannot be empty');
        }
        const topK = request.topK ?? 10;
        let patents = searchResults || [];
        if (patents.length === 0) {
            const searchRes = await this.searchService.search({ query, topK });
            patents = searchRes.results || [];
        }
        if (patents.length === 0) {
            console.log(`[OverlapAnalysisService] Empty retrieval results for query="${query}"`);
            return [];
        }
        // 1. Context Construction & Prompt Building Phase
        const promptStart = Date.now();
        const systemPrompt = OverlapAnalysisPromptBuilder.getSystemPrompt();
        const promptText = OverlapAnalysisPromptBuilder.buildPrompt(query, patents, {
            maxClaimsLength: 500,
            maxPatentsCount: topK,
        });
        const promptTimeMs = Date.now() - promptStart;
        // 2. LLM Generation Phase: Query Qwen via Ollama
        const llmStart = Date.now();
        const rawLlmOutput = await this.llmProvider.generateCompletion(promptText, {
            systemPrompt,
            temperature: 0.2,
        });
        const llmInferenceTimeMs = Date.now() - llmStart;
        // 3. Response Parsing Phase
        const overlapItems = OverlapAnalysisPromptBuilder.parseOverlapAnalysisResponse(rawLlmOutput, patents);
        const totalOverlapTimeMs = Date.now() - totalStart;
        const overlappingClaimsCount = overlapItems.reduce((sum, item) => sum + (item.overlappingClaims ? item.overlappingClaims.length : 0), 0);
        console.log(`[OverlapAnalysisService] Section & Claim Overlap Analysis completed | analyzedPatents=${patents.length} | overlappingClaimsCount=${overlappingClaimsCount} | promptMs=${promptTimeMs}ms | llmMs=${llmInferenceTimeMs}ms | totalMs=${totalOverlapTimeMs}ms`);
        return overlapItems;
    }
}
//# sourceMappingURL=overlap-analysis.service.js.map