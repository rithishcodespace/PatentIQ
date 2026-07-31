import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SearchController } from '../controllers/search.controller.js';


export async function searchRoutes(fastify: FastifyInstance, controller: SearchController): Promise<void> {
  // Handles POST / when mounted under prefix /api/search or /api/v1/search
  fastify.post('/', (req: FastifyRequest, reply: FastifyReply) => controller.search(req, reply));

  // Legacy / RAG sub-route handling
  fastify.post('/prior-art', (req: FastifyRequest, reply: FastifyReply) => controller.searchPriorArt(req, reply));
}

