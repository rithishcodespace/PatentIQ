import type { FastifyInstance } from 'fastify';
import { EmbeddingsController } from '../controllers/embeddings.controller.js';

export async function embeddingsRoutes(fastify: FastifyInstance, controller: EmbeddingsController): Promise<void> {
  fastify.post('/generate', (req, reply) => controller.generate(req as any, reply));
  fastify.post('/batch', (req, reply) => controller.generateBatch(req as any, reply));
}
