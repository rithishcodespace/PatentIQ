import type { FastifyInstance } from 'fastify';
import { SearchController } from '../controllers/search.controller.js';
import { BenchmarkController } from '../controllers/benchmark.controller.js';
export declare function searchRoutes(fastify: FastifyInstance, controller: SearchController, benchmarkController?: BenchmarkController): Promise<void>;
//# sourceMappingURL=search.routes.d.ts.map