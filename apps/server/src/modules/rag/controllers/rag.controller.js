import { RagAnalysisRequestDtoSchema, HybridRankingDtoSchema, } from '../dto/rag.dto.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';
export class RagController {
    ragService;
    constructor(ragService) {
        this.ragService = ragService;
    }
    /**
     * Endpoint Handler: POST /api/rag/analyze
     * Performs semantic retrieval, 7-section novelty analysis, and section/claim overlap analysis via Ollama (Qwen).
     */
    async analyze(request, reply) {
        // 1. Zod Validation
        const parseResult = RagAnalysisRequestDtoSchema.safeParse(request.body);
        if (!parseResult.success) {
            const issue = parseResult.error.issues[0];
            const errorMessage = issue ? issue.message : 'Invalid search request body';
            throw new BadRequestError(errorMessage);
        }
        const validatedDto = parseResult.data;
        // 2. Call RAG Service pipeline
        const response = await this.ragService.analyze(validatedDto);
        // 3. Log Performance Summary Metrics without logging full prompt or payload
        const metrics = response.metrics;
        const retrievedCount = response.retrievedPatents ? response.retrievedPatents.length : (metrics?.retrievedCount ?? 0);
        request.log.info(`[RagAPI] query="${response.query}" | retrievedCount=${retrievedCount} | overlappingClaims=${metrics?.overlappingClaimsCount ?? 0} | retrievalMs=${metrics?.retrievalTimeMs ?? 0}ms | promptMs=${metrics?.promptTimeMs ?? 0}ms | llmMs=${metrics?.llmInferenceTimeMs ?? 0}ms | totalMs=${metrics?.totalTimeMs ?? 0}ms`);
        // 4. Return JSON response payload
        const responsePayload = {
            success: response.success,
            query: response.query,
            analysis: response.analysis,
        };
        if (response.deconstructedFeatures) {
            responsePayload.deconstructedFeatures = response.deconstructedFeatures;
        }
        if (response.overlapAnalysis) {
            responsePayload.overlapAnalysis = response.overlapAnalysis;
        }
        if (response.retrievedPatents && response.retrievedPatents.length > 0) {
            responsePayload.retrievedPatents = response.retrievedPatents;
        }
        reply.status(200).send(responsePayload);
    }
    /**
     * Endpoint Handler: POST /api/rag/deconstruct
     * Deconstructs plain text invention query/disclosure into structured technical features.
     */
    async deconstruct(request, reply) {
        if (!request.body || typeof request.body !== 'object') {
            throw new BadRequestError('Request body is required');
        }
        const body = request.body;
        const inputQuery = body.query || body.text || '';
        if (!inputQuery || typeof inputQuery !== 'string' || !inputQuery.trim()) {
            throw new BadRequestError('query or text is required');
        }
        const result = await this.ragService.deconstructInvention(inputQuery.trim());
        reply.status(200).send({
            success: true,
            data: result,
        });
    }
    /**
     * Backward-compatible endpoint handler: POST /api/rag/rank
     */
    async rank(request, reply) {
        const parseResult = HybridRankingDtoSchema.safeParse(request.body);
        if (!parseResult.success) {
            throw new BadRequestError('Invalid hybrid ranking request body');
        }
        const candidates = await this.ragService.hybridRank(parseResult.data);
        const reranked = await this.ragService.rerankCrossEncoder(candidates);
        reply.status(200).send({
            success: true,
            data: reranked,
            message: 'Hybrid RAG ranking completed',
        });
    }
}
//# sourceMappingURL=rag.controller.js.map