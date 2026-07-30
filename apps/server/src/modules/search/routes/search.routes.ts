import type { FastifyInstance } from 'fastify';
import { SearchController } from '../controllers/search.controller.js';

export async function searchRoutes(fastify: FastifyInstance, controller: SearchController): Promise<void> {
  fastify.post('/prior-art', (req, reply) => controller.searchPriorArt(req as any, reply));
}
