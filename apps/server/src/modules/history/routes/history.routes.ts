import type { FastifyInstance } from 'fastify';
import type { HistoryController } from '../controllers/history.controller.js';
import {
  HistoryListResponseSchema,
  HistoryRecordSchema,
  standardErrorResponses,
} from '../../../common/schemas/swagger.schemas.js';

export async function historyRoutes(
  fastify: FastifyInstance,
  historyController: HistoryController
): Promise<void> {
  // GET /api/history - Paginated search history listing with filtering & sorting
  fastify.get('/', {
    schema: {
      tags: ['History'],
      summary: 'List Search History & Novelty Analyses',
      description:
        'Retrieves paginated search history records from PostgreSQL database supporting query string filtering, date range bounds, IPC classification, and sorting.',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1, example: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 10 },
          sortBy: {
            type: 'string',
            enum: ['createdAt', 'searchQuery', 'totalResults', 'searchLatency'],
            default: 'createdAt',
            example: 'createdAt',
          },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc', example: 'desc' },
          startDate: { type: 'string', format: 'date-time', example: '2026-08-01T00:00:00.000Z' },
          endDate: { type: 'string', format: 'date-time', example: '2026-08-01T23:59:59.999Z' },
          query: { type: 'string', description: 'Search query keyword filter', example: 'wireless charging' },
          ipc: { type: 'string', description: 'IPC classification filter', example: 'B64C' },
          minScore: { type: 'number', minimum: 0, maximum: 1, example: 0.75 },
          maxScore: { type: 'number', minimum: 0, maximum: 1, example: 1.0 },
          userId: { type: 'string', example: 'usr-12345' },
        },
      },
      response: {
        200: HistoryListResponseSchema,
        400: standardErrorResponses[400],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => historyController.getHistory(req, reply),
  });

  // GET /api/history/:id - Detailed history record by ID
  fastify.get('/:id', {
    schema: {
      tags: ['History'],
      summary: 'Get Search History & Novelty Analysis Details by ID',
      description:
        'Retrieves full details of a specific search history entry including retrieved patents and generated novelty analysis report.',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid', example: 'a540aa40-a25c-427c-8848-dea943861a3a' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: HistoryRecordSchema,
          },
        },
        400: standardErrorResponses[400],
        404: standardErrorResponses[404],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => historyController.getHistoryById(req, reply),
  });

  // DELETE /api/history/:id - Cascading delete of SearchHistory record
  fastify.delete('/:id', {
    schema: {
      tags: ['History'],
      summary: 'Delete Search History Entry',
      description:
        'Deletes a search history entry by ID. Cascades deletion to associated retrieved patent matches and novelty analysis reports.',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid', example: 'a540aa40-a25c-427c-8848-dea943861a3a' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: "Search history record 'a540aa40-a25c-427c-8848-dea943861a3a' successfully deleted" },
          },
        },
        400: standardErrorResponses[400],
        404: standardErrorResponses[404],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => historyController.deleteHistory(req, reply),
  });
}
