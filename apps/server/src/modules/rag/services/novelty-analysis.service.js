import { NoveltyAnalysisPromptBuilder } from '../prompts/novelty-analysis.prompt.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';
export class NoveltyAnalysisService {
    searchService;
    llmProvider;
    historyService;
    constructor(searchService, llmProvider, historyService) {
        this.searchService = searchService;
        this.llmProvider = llmProvider;
        this.historyService = historyService;
    }
    /**
     * Performs grounded 7-section AI novelty analysis using Qwen (Ollama)
     * on Top-K prior-art patents retrieved from SearchService.
     */
    async analyzeNovelty(request) {
        const totalStart = Date.now();
        const query = request.query ? request.query.trim() : '';
        if (!query) {
            throw new BadRequestError('query cannot be empty');
        }
        const topK = request.topK ?? 10;
        if (topK < 1 || topK > 100) {
            throw new BadRequestError('maximum topK is 100');
        }
        // 0. Reuse Check: Check if an analysis for exact search query already exists
        if (this.historyService) {
            const existingHistory = await this.historyService.findReusableAnalysis(query);
            if (existingHistory && existingHistory.noveltyAnalysis) {
                const na = existingHistory.noveltyAnalysis;
                let parsedNovelty = {};
                try {
                    parsedNovelty = JSON.parse(na.novelty);
                }
                catch {
                    parsedNovelty = { details: na.novelty };
                }
                const reconstructedAnalysis = {
                    summary: na.summary,
                    similarPatents: parsedNovelty.similarPatents || [],
                    featureComparison: parsedNovelty.featureComparison || { commonFeatures: [], uniqueFeatures: [], partialOverlap: [] },
                    novelAspects: parsedNovelty.novelAspects || [],
                    overlappingClaims: Array.isArray(na.overlappingClaims) ? na.overlappingClaims : [],
                    risks: parsedNovelty.risks || [],
                    recommendations: Array.isArray(na.recommendations) ? na.recommendations : [],
                };
                const totalTimeMs = Date.now() - totalStart;
                console.log(`[NoveltyAnalysisService] Reused existing analysis from database | query="${query}" | historyId=${existingHistory.id}`);
                return {
                    success: true,
                    query,
                    retrievedPatents: (existingHistory.retrievedPatents || []).map((p) => ({
                        patentId: p.patentId,
                        title: p.title,
                        score: p.similarityScore,
                        ipc: p.ipc,
                        abstract: p.metadata?.abstract || '',
                        section: p.metadata?.section || 'full',
                    })),
                    analysis: reconstructedAnalysis,
                    metrics: {
                        retrievalTimeMs: 0,
                        promptTimeMs: 0,
                        llmInferenceTimeMs: 0,
                        totalTimeMs,
                        retrievedCount: existingHistory.retrievedPatents?.length || 0,
                    },
                };
            }
        }
        // 1. Retrieval Phase: Query SearchService for Top-K patents
        const retrievalStart = Date.now();
        const searchResponse = await this.searchService.search({ query, topK });
        const retrievalTimeMs = Date.now() - retrievalStart;
        const results = searchResponse.results || [];
        const retrievedPatents = results.map((p) => ({
            patentId: p.patentId,
            title: p.title,
            score: p.score,
            ipc: p.ipc,
            abstract: p.abstract,
            section: p.section,
        }));
        // Handle empty retrieval results cleanly without failing
        if (results.length === 0) {
            const totalTimeMs = Date.now() - totalStart;
            const metrics = {
                retrievalTimeMs,
                promptTimeMs: 0,
                llmInferenceTimeMs: 0,
                totalTimeMs,
                retrievedCount: 0,
            };
            const fallbackAnalysis = NoveltyAnalysisPromptBuilder.createFallbackResult(`No prior-art patents were retrieved matching invention query "${query}".`);
            console.log(`[NoveltyAnalysisService] Analysis completed (Empty Retrieval) | query="${query}" | count=0 | latency=${totalTimeMs}ms`);
            return {
                success: true,
                query,
                retrievedPatents: [],
                analysis: fallbackAnalysis,
                metrics,
            };
        }
        // 2. Context Construction & Prompt Building Phase
        const promptStart = Date.now();
        const systemPrompt = NoveltyAnalysisPromptBuilder.getSystemPrompt();
        const promptText = NoveltyAnalysisPromptBuilder.buildPrompt(query, results, {
            maxClaimsLength: 500,
            maxPatentsCount: topK,
        });
        const promptTimeMs = Date.now() - promptStart;
        // 3. LLM Generation Phase: Query Qwen via Ollama
        const llmStart = Date.now();
        const rawLlmOutput = await this.llmProvider.generateCompletion(promptText, {
            systemPrompt,
            temperature: 0.2,
        });
        const llmInferenceTimeMs = Date.now() - llmStart;
        // 4. Response Parsing Phase
        const analysis = NoveltyAnalysisPromptBuilder.parseNoveltyAnalysisResponse(rawLlmOutput);
        const totalTimeMs = Date.now() - totalStart;
        const metrics = {
            retrievalTimeMs,
            promptTimeMs,
            llmInferenceTimeMs,
            totalTimeMs,
            retrievedCount: retrievedPatents.length,
        };
        // 5. Persist complete search history & novelty analysis atomically in database
        if (this.historyService) {
            try {
                const noveltyPayload = {
                    similarPatents: analysis.similarPatents,
                    featureComparison: analysis.featureComparison,
                    novelAspects: analysis.novelAspects,
                    risks: analysis.risks,
                };
                await this.historyService.saveCompleteSearchAndAnalysis({
                    searchQuery: query,
                    topK,
                    appliedFilters: searchResponse.filters ? searchResponse.filters : null,
                    totalResults: results.length,
                    searchLatency: totalTimeMs,
                    retrievedPatents: results.map((p) => ({
                        patentId: p.patentId,
                        title: p.title || `Patent ${p.patentId}`,
                        similarityScore: p.score,
                        ipc: p.ipc,
                        country: p.country,
                        publicationDate: p.publicationDate,
                        owner: p.owner,
                        metadata: { section: p.section, abstract: p.abstract },
                    })),
                    noveltyAnalysis: {
                        summary: analysis.summary,
                        novelty: JSON.stringify(noveltyPayload),
                        overlappingClaims: analysis.overlappingClaims,
                        recommendations: analysis.recommendations,
                        confidenceScore: 0.92,
                        rawLLMResponse: rawLlmOutput,
                    },
                });
            }
            catch (err) {
                console.warn(`[NoveltyAnalysisService] Failed to persist complete search and analysis: ${err.message}`);
            }
        }
        console.log(`[NoveltyAnalysisService] Novelty Analysis completed | query="${query}" | retrievedCount=${retrievedPatents.length} | retrievalMs=${retrievalTimeMs}ms | promptMs=${promptTimeMs}ms | llmMs=${llmInferenceTimeMs}ms | totalMs=${totalTimeMs}ms`);
        return {
            success: true,
            query,
            retrievedPatents,
            analysis,
            metrics,
        };
    }
}
//# sourceMappingURL=novelty-analysis.service.js.map