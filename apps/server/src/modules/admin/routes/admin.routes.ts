import type { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/admin.controller.js';
import { standardErrorResponses } from '../../../common/schemas/swagger.schemas.js';

export async function adminRoutes(fastify: FastifyInstance, controller: AdminController): Promise<void> {
  // GET /status - System admin status
  fastify.get('/status', {
    schema: {
      tags: ['Admin'],
      summary: 'Get System Health & Administrative Status',
      description: 'Returns health status of vector database, LLM provider, and worker queues.',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            pineconeHealthy: { type: 'boolean', example: true },
            ollamaHealthy: { type: 'boolean', example: true },
            databaseHealthy: { type: 'boolean', example: true },
            pendingJobsCount: { type: 'integer', example: 0 },
          },
        },
        401: standardErrorResponses[401],
        403: standardErrorResponses[403],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.getStatus(req, reply),
  });

  // POST /reindex - Reindex patent vector embeddings
  fastify.post('/reindex', {
    schema: {
      tags: ['Admin'],
      summary: 'Trigger Vector Embedding Reindexing Job',
      description: 'Triggers background batch reindexing of patent dataset embeddings into Pinecone.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          forceAll: { type: 'boolean', default: false, example: false },
          batchSize: { type: 'integer', default: 50, example: 50 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Reindexing job started' },
            jobId: { type: 'string', format: 'uuid', example: 'job-991122' },
          },
        },
        401: standardErrorResponses[401],
        403: standardErrorResponses[403],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.triggerReindex(req as any, reply),
  });

  // POST /clear-cache - Clear system cache
  fastify.post('/clear-cache', {
    schema: {
      tags: ['Admin'],
      summary: 'Clear System Cache',
      description: 'Flushes cached novelty analyses and query results.',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'System cache cleared successfully' },
          },
        },
        401: standardErrorResponses[401],
        403: standardErrorResponses[403],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.clearCache(req, reply),
  });
}
