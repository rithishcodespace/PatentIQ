import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IRagService } from '../interfaces/rag.interface.js';
import type { DesignAroundService } from '../services/design-around.service.js';
export declare class RagController {
    private readonly ragService;
    private readonly designAroundService?;
    constructor(ragService: IRagService, designAroundService?: DesignAroundService | undefined);
    /**
     * Endpoint Handler: POST /api/rag/analyze
     * Performs semantic retrieval, 7-section novelty analysis, and section/claim overlap analysis via Ollama (Qwen).
     */
    analyze(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    /**
     * Endpoint Handler: POST /api/rag/deconstruct
     * Deconstructs plain text invention query/disclosure into structured technical features.
     */
    deconstruct(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    /**
     * Backward-compatible endpoint handler: POST /api/rag/rank
     */
    rank(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    /**
     * Endpoint Handler: POST /api/rag/design-around
     * Generates actionable engineering design-around recommendations.
     */
    designAround(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=rag.controller.d.ts.map