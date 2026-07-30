import type { FastifyInstance } from 'fastify';
import { AnalyticsController } from '../controllers/analytics.controller.js';

export async function analyticsRoutes(fastify: FastifyInstance, controller: AnalyticsController): Promise<void> {
  fastify.get('/overview', (req, reply) => controller.getOverview(req, reply));
}
