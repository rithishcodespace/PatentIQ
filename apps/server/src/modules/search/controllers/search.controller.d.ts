import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ISearchService } from '../interfaces/search.interface.js';
import type { BenchmarkController } from './benchmark.controller.js';
import type { NoveltyMatrixService } from '../../rag/services/novelty-matrix.service.js';
export declare class SearchController {
    private readonly searchService;
    readonly benchmarkController?: BenchmarkController | undefined;
    private readonly noveltyMatrixService?;
    constructor(searchService: ISearchService, benchmarkController?: BenchmarkController | undefined, noveltyMatrixService?: NoveltyMatrixService | undefined);
    /**
     * HTTP POST /api/search Handler.
     */
    search(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    /**
     * Endpoint Handler: POST /api/search/benchmark
     */
    benchmark(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    /**
     * Backward-compatible handler for POST /api/v1/search/prior-art.
     */
    searchPriorArt(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    /**
     * Endpoint Handler: POST /api/search/novelty-matrix
     */
    getNoveltyMatrix(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=search.controller.d.ts.map