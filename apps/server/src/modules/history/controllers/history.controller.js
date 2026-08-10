import { HistoryQueryFilterDtoSchema, HistoryParamIdDtoSchema } from '../dto/history.dto.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';
export class HistoryController {
    historyService;
    constructor(historyService) {
        this.historyService = historyService;
    }
    /**
     * Endpoint Handler: GET /api/history
     * Retrieves paginated search history records supporting sorting and filtering.
     */
    async getHistory(request, reply) {
        const parseResult = HistoryQueryFilterDtoSchema.safeParse(request.query);
        if (!parseResult.success) {
            const issue = parseResult.error.issues[0];
            const message = issue ? issue.message : 'Invalid query filter parameters';
            throw new BadRequestError(message);
        }
        const validatedFilters = parseResult.data;
        const response = await this.historyService.listHistory(validatedFilters);
        request.log.info(`[HistoryAPI] GET /api/history | page=${response.meta.page} | limit=${response.meta.limit} | totalItems=${response.meta.totalItems}`);
        reply.status(200).send(response);
    }
    /**
     * Endpoint Handler: GET /api/history/:id
     * Retrieves detailed search query, retrieved patents, and novelty analysis by history ID.
     */
    async getHistoryById(request, reply) {
        const parseResult = HistoryParamIdDtoSchema.safeParse(request.params);
        if (!parseResult.success) {
            throw new BadRequestError('Invalid search history ID parameter');
        }
        const { id } = parseResult.data;
        const record = await this.historyService.getHistoryById(id);
        request.log.info(`[HistoryAPI] GET /api/history/${id} | found=true`);
        reply.status(200).send({
            success: true,
            data: record,
        });
    }
    /**
     * Endpoint Handler: DELETE /api/history/:id
     * Deletes SearchHistory and cascades deletion to RetrievedPatents & NoveltyAnalysis.
     */
    async deleteHistory(request, reply) {
        const parseResult = HistoryParamIdDtoSchema.safeParse(request.params);
        if (!parseResult.success) {
            throw new BadRequestError('Invalid search history ID parameter');
        }
        const { id } = parseResult.data;
        const response = await this.historyService.deleteHistory(id);
        request.log.info(`[HistoryAPI] DELETE /api/history/${id} | status=deleted`);
        reply.status(200).send(response);
    }
}
//# sourceMappingURL=history.controller.js.map