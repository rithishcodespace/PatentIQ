import type { FastifyInstance } from 'fastify';
import { RagController } from '../controllers/rag.controller.js';

export async function ragRoutes(fastify: FastifyInstance, controller: RagController): Promise<void> {
  fastify.post('/rank', (req, reply) => controller.rank(req as any, reply));
}
