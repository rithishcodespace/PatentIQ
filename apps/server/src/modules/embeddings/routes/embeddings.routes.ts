import type { FastifyInstance } from 'fastify';
import { EmbeddingsController } from '../controllers/embeddings.controller.js';
import { standardErrorResponses } from '../../../common/schemas/swagger.schemas.js';

export async function embeddingsRoutes(fastify: FastifyInstance, controller: EmbeddingsController): Promise<void> {
  // POST /generate - Generate embedding for query text
  fastify.post('/generate', {
    schema: {
      tags: ['Embeddings'],
      summary: 'Generate Text Embedding Vector',
      description: 'Generates 768-dimensional dense vector embeddings using Ollama nomic-embed-text model.',
      body: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', example: 'Wireless inductive power transfer system' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            embedding: { type: 'array', items: { type: 'number' } },
            dimensions: { type: 'integer', example: 768 },
            durationMs: { type: 'integer', example: 42 },
          },
        },
        400: standardErrorResponses[400],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.generate(req as any, reply),
  });

  // POST /batch - Generate embeddings for multiple text passages
  fastify.post('/batch', {
    schema: {
      tags: ['Embeddings'],
      summary: 'Batch Generate Vector Embeddings',
      description: 'Generates dense vector embeddings for a list of text passages in batch mode.',
      body: {
        type: 'object',
        required: ['texts'],
        properties: {
          texts: { type: 'array', items: { type: 'string' }, example: ['Claim 1: Inductive charging', 'Claim 2: Frequency tuning'] },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            embeddings: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
            count: { type: 'integer', example: 2 },
          },
        },
        400: standardErrorResponses[400],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.generateBatch(req as any, reply),
  });
}
