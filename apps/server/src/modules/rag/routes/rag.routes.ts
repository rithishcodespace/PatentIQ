import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { RagController } from '../controllers/rag.controller.js';

export async function ragRoutes(fastify: FastifyInstance, controller: RagController): Promise<void> {
  fastify.post('/analyze', (req: FastifyRequest, reply: FastifyReply) => controller.analyze(req, reply));
  fastify.post('/rank', (req: FastifyRequest, reply: FastifyReply) => controller.rank(req, reply));
}
