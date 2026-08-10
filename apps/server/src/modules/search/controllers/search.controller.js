import { SearchRequestDtoSchema, NoveltyMatrixRequestDtoSchema } from '../dto/search.dto.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';
export class SearchController {
    searchService;
    benchmarkController;
    noveltyMatrixService;
    constructor(searchService, benchmarkController, noveltyMatrixService) {
        this.searchService = searchService;
        this.benchmarkController = benchmarkController;
        this.noveltyMatrixService = noveltyMatrixService;
    }
    /**
     * HTTP POST /api/search Handler.
     */
    async search(request, reply) {
        if (!request.body || typeof request.body !== 'object') {
            throw new BadRequestError('query is required');
        }
        // 1. Validate request payload using Zod schema
        const parseResult = SearchRequestDtoSchema.safeParse(request.body);
        if (!parseResult.success) {
            const issue = parseResult.error.issues[0];
            const errorMessage = issue ? issue.message : 'Invalid request payload';
            throw new BadRequestError(errorMessage);
        }
        const validatedDto = parseResult.data;
        // 2. Call service layer
        const response = await this.searchService.search(validatedDto);
        // 3. Log performance summary metrics without full payload
        const highestScore = response.results && response.results.length > 0 ? response.results[0]?.score ?? 0 : 0;
        const latencyMs = response.metrics?.totalExecutionTimeMs ?? 0;
        const requestedTopK = validatedDto.topK ?? 10;
        request.log.info(`[SearchAPI] query="${response.query}" | topK=${requestedTopK} | count=${response.count} | highestScore=${highestScore} | latency=${latencyMs}ms`);
        // 4. Return JSON response
        reply.status(200).send(response);
    }
    /**
     * Endpoint Handler: POST /api/search/benchmark
     */
    async benchmark(request, reply) {
        if (this.benchmarkController) {
            return this.benchmarkController.benchmark(request, reply);
        }
        throw new BadRequestError('Benchmark feature is not available');
    }
    /**
     * Backward-compatible handler for POST /api/v1/search/prior-art.
     */
    async searchPriorArt(request, reply) {
        await this.search(request, reply);
    }
    /**
     * Endpoint Handler: POST /api/search/novelty-matrix
     */
    async getNoveltyMatrix(request, reply) {
        if (!request.body || typeof request.body !== 'object') {
            throw new BadRequestError('Request body is required');
        }
        const parseResult = NoveltyMatrixRequestDtoSchema.safeParse(request.body);
        if (!parseResult.success) {
            const issue = parseResult.error.issues[0];
            throw new BadRequestError(issue ? issue.message : 'Invalid novelty matrix request payload');
        }
        if (!this.noveltyMatrixService) {
            throw new BadRequestError('Novelty Matrix service is not initialized');
        }
        const matrixResult = await this.noveltyMatrixService.generateNoveltyMatrix(parseResult.data);
        reply.status(200).send(matrixResult);
    }
}
//# sourceMappingURL=search.controller.js.map