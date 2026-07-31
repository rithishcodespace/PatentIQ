import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SearchController } from '../controllers/search.controller.js';

export async function searchRoutes(fastify: FastifyInstance, controller: SearchController): Promise<void> {
  // Primary POST /api/search endpoint
  fastify.post('/api/search', (req: FastifyRequest, reply: FastifyReply) => controller.search(req, reply));

  // Mounted route handling (e.g. when prefix is /api/search or /api/v1/search)
  fastify.post('/', (req: FastifyRequest, reply: FastifyReply) => controller.search(req, reply));
  fastify.post('/prior-art', (req: FastifyRequest, reply: FastifyReply) => controller.search(req, reply));
}
