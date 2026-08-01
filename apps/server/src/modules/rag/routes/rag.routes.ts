import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { RagController } from '../controllers/rag.controller.js';
import {
  SearchRequestSchema,
  RagAnalysisResponseSchema,
  standardErrorResponses,
} from '../../../common/schemas/swagger.schemas.js';

export async function ragRoutes(fastify: FastifyInstance, controller: RagController): Promise<void> {
  // POST /api/rag/analyze - AI Grounded Novelty Analysis & Overlap Detection
  fastify.post('/analyze', {
    schema: {
      tags: ['RAG'],
      summary: 'Grounded 7-Section AI Novelty Analysis & Overlap Detection',
      description:
        'Retrieves Top-K prior-art candidates and prompts Qwen LLM via Ollama to generate a 7-section novelty report, section/claim overlaps, risk classification, and patentability recommendations. Automatically checks for and reuses existing cached analyses to save compute costs.',
      body: SearchRequestSchema,
      response: {
        200: RagAnalysisResponseSchema,
        400: standardErrorResponses[400],
        500: standardErrorResponses[500],
      },
    },
    handler: (req: FastifyRequest, reply: FastifyReply) => controller.analyze(req, reply),
  });

  // POST /api/rag/rank - Hybrid Ranking & Cross-Encoder Reranking
  fastify.post('/rank', {
    schema: {
      tags: ['RAG'],
      summary: 'Hybrid Candidate Ranking',
      description: 'Combines vector semantic similarity with claim overlap scores for hybrid candidate reranking.',
      body: {
        type: 'object',
        required: ['queryText'],
        properties: {
          queryText: { type: 'string', example: 'Wireless inductive charging system' },
          topRawResults: { type: 'integer', default: 100, example: 50 },
          topRerankedResults: { type: 'integer', default: 20, example: 10 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            candidates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  patentId: { type: 'string', example: 'US-9876543-B2' },
                  combinedScore: { type: 'number', example: 0.88 },
                  semanticScore: { type: 'number', example: 0.91 },
                  bm25Score: { type: 'number', example: 0.75 },
                },
              },
            },
          },
        },
        400: standardErrorResponses[400],
        500: standardErrorResponses[500],
      },
    },
    handler: (req: FastifyRequest, reply: FastifyReply) => controller.rank(req, reply),
  });
}
