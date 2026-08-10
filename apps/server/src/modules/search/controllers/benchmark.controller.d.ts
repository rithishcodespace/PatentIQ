import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IBenchmarkService } from '../interfaces/benchmark.interface.js';
export declare class BenchmarkController {
    private readonly benchmarkService;
    constructor(benchmarkService: IBenchmarkService);
    /**
     * HTTP POST /api/search/benchmark Handler.
     * Executes multi-query performance benchmark and calculates latency percentiles and IR quality metrics.
     */
    benchmark(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=benchmark.controller.d.ts.map