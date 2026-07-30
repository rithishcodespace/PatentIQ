import type { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/admin.controller.js';

export async function adminRoutes(fastify: FastifyInstance, controller: AdminController): Promise<void> {
  fastify.get('/status', (req, reply) => controller.getStatus(req, reply));
  fastify.post('/reindex', (req, reply) => controller.triggerReindex(req as any, reply));
  fastify.post('/clear-cache', (req, reply) => controller.clearCache(req, reply));
}
