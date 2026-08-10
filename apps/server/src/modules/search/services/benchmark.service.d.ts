import type { IBenchmarkService, BenchmarkRequest, BenchmarkReport } from '../interfaces/benchmark.interface.js';
import type { ISearchService } from '../interfaces/search.interface.js';
export declare class BenchmarkService implements IBenchmarkService {
    private readonly searchService;
    constructor(searchService: ISearchService);
    /**
     * Executes multi-query, multi-iteration benchmarking and IR quality evaluation over the search engine.
     */
    runBenchmark(request: BenchmarkRequest): Promise<BenchmarkReport>;
}
//# sourceMappingURL=benchmark.service.d.ts.map