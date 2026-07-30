import type { FastifyInstance } from 'fastify';
import { PatentsController } from '../controllers/patents.controller.js';

export async function patentsRoutes(fastify: FastifyInstance, controller: PatentsController): Promise<void> {
  fastify.post('/', (req, reply) => controller.create(req as any, reply));
  fastify.get('/', (req, reply) => controller.list(req as any, reply));
  fastify.get('/:id', (req, reply) => controller.getById(req as any, reply));
}
