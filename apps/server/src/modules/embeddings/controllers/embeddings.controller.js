import { ResponseFormatter } from '../../../common/utils/response.formatter.js';
export class EmbeddingsController {
    embeddingsService;
    constructor(embeddingsService) {
        this.embeddingsService = embeddingsService;
    }
    async generate(request, reply) {
        const result = await this.embeddingsService.generateAndStoreEmbedding(request.body);
        reply.send(ResponseFormatter.success(result, 'Embedding generated and stored'));
    }
    async generateBatch(request, reply) {
        const result = await this.embeddingsService.generateBatchAndStoreEmbeddings(request.body);
        reply.send(ResponseFormatter.success(result, 'Batch embeddings generated and stored'));
    }
}
//# sourceMappingURL=embeddings.controller.js.map