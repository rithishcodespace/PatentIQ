import type { FastifyRequest, FastifyReply } from 'fastify';
import type { IHistoryService } from '../interfaces/history.interface.js';
export declare class HistoryController {
    private readonly historyService;
    constructor(historyService: IHistoryService);
    /**
     * Endpoint Handler: GET /api/history
     * Retrieves paginated search history records supporting sorting and filtering.
     */
    getHistory(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    /**
     * Endpoint Handler: GET /api/history/:id
     * Retrieves detailed search query, retrieved patents, and novelty analysis by history ID.
     */
    getHistoryById(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    /**
     * Endpoint Handler: DELETE /api/history/:id
     * Deletes SearchHistory and cascades deletion to RetrievedPatents & NoveltyAnalysis.
     */
    deleteHistory(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=history.controller.d.ts.map