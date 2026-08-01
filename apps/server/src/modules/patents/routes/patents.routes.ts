import type { FastifyInstance } from 'fastify';
import { PatentsController } from '../controllers/patents.controller.js';
import { PatentResultSchema, standardErrorResponses } from '../../../common/schemas/swagger.schemas.js';

export async function patentsRoutes(fastify: FastifyInstance, controller: PatentsController): Promise<void> {
  // POST / - Create patent entry
  fastify.post('/', {
    schema: {
      tags: ['Upload'],
      summary: 'Create Patent Entry',
      description: 'Creates a patent record in the system database.',
      body: {
        type: 'object',
        required: ['patentId', 'title', 'abstract', 'ipc'],
        properties: {
          patentId: { type: 'string', example: 'US-9876543-B2' },
          title: { type: 'string', example: 'Inductive wireless power transfer system' },
          abstract: { type: 'string', example: 'A wireless power transfer system...' },
          claims: { type: 'string', example: '1. A wireless power transfer system...' },
          ipc: { type: 'string', example: 'H02J 50/12' },
          country: { type: 'string', example: 'US' },
          publicationDate: { type: 'string', example: '2023-04-15' },
          owner: { type: 'string', example: 'PowerTech Global LLC' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            patent: PatentResultSchema,
          },
        },
        400: standardErrorResponses[400],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.create(req as any, reply),
  });

  // GET / - List patents
  fastify.get('/', {
    schema: {
      tags: ['Upload'],
      summary: 'List Patents',
      description: 'Retrieves a list of indexed patent records.',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1, example: 1 },
          limit: { type: 'integer', default: 10, example: 10 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            patents: { type: 'array', items: PatentResultSchema },
          },
        },
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.list(req as any, reply),
  });

  // GET /:id - Get patent by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Upload'],
      summary: 'Get Patent by ID',
      description: 'Retrieves detailed information for a single patent record.',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', example: 'US-9876543-B2' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            patent: PatentResultSchema,
          },
        },
        404: standardErrorResponses[404],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.getById(req as any, reply),
  });
}
