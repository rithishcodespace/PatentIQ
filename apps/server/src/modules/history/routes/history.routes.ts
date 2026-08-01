import type { FastifyInstance } from 'fastify';
import type { HistoryController } from '../controllers/history.controller.js';

export async function historyRoutes(
  fastify: FastifyInstance,
  historyController: HistoryController
): Promise<void> {
  // GET /api/history - Paginated search history listing with filtering & sorting
  fastify.get('/', (req, reply) => historyController.getHistory(req, reply));

  // GET /api/history/:id - Detailed history record including retrieved patents & novelty analysis
  fastify.get('/:id', (req, reply) => historyController.getHistoryById(req, reply));

  // DELETE /api/history/:id - Cascading delete of SearchHistory, RetrievedPatents, & NoveltyAnalysis
  fastify.delete('/:id', (req, reply) => historyController.deleteHistory(req, reply));
}
