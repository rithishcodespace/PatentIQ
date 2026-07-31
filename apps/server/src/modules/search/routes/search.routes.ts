import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SearchController } from '../controllers/search.controller.js';
import { BenchmarkController } from '../controllers/benchmark.controller.js';

export async function searchRoutes(
  fastify: FastifyInstance,
  controller: SearchController,
  benchmarkController?: BenchmarkController
): Promise<void> {
  // Handles POST / when mounted under prefix /api/search or /api/v1/search
  fastify.post('/', (req: FastifyRequest, reply: FastifyReply) => controller.search(req, reply));

  // Handles POST /benchmark when mounted under prefix /api/search or /api/v1/search
  fastify.post('/benchmark', (req: FastifyRequest, reply: FastifyReply) => {
    if (benchmarkController) {
      return benchmarkController.benchmark(req, reply);
    }
    return controller.benchmark(req, reply);
  });

  // Legacy / RAG sub-route handling
  fastify.post('/prior-art', (req: FastifyRequest, reply: FastifyReply) => controller.searchPriorArt(req, reply));
}
