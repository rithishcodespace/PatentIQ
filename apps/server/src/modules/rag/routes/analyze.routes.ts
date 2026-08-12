import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { RagController } from '../controllers/rag.controller.js';
import { standardErrorResponses } from '../../../common/schemas/swagger.schemas.js';

export async function analyzeRoutes(fastify: FastifyInstance, controller: RagController): Promise<void> {
  fastify.post('/', {
    schema: {
      tags: ['Analysis'],
      summary: 'Evidence-Based Prior-Art Feature Analysis',
      description:
        'Extracts key technical features from an invention disclosure and searches the selected patent indexed content for supporting evidence, returning MATCH/PARTIAL_MATCH/NOT_FOUND status, section (Claim, Abstract, Description), claim numbers, and verbatim text.',
      body: {
        type: 'object',
        required: ['patentId'],
        properties: {
          invention: { type: 'string', example: 'Autonomous drone using LiDAR for obstacle detection and wireless charging' },
          inventionDisclosure: { type: 'string' },
          query: { type: 'string' },
          patentId: { type: 'string', example: 'US1001' },
          selectedPatentId: { type: 'string' },
          sessionId: { type: 'string', example: 'sess-123' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            patent: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'US1001' },
                patentNumber: { type: 'string', example: 'US1001' },
                title: { type: 'string', example: 'Autonomous Aerial Inspection Vehicle' },
                sourceUrl: { type: 'string', example: 'https://patents.google.com/patent/US1001/en' },
              },
            },
            features: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'F1' },
                  text: { type: 'string', example: 'Uses LiDAR for object detection' },
                  status: { type: 'string', example: 'MATCH' },
                  matchStrength: { type: 'number', example: 0.91 },
                  evidence: {
                    type: ['object', 'null'],
                    properties: {
                      text: { type: 'string', example: '...comprising a LiDAR sensor array for object detection...' },
                      section: { type: 'string', example: 'Claim' },
                      claimNumber: { type: 'integer', example: 2 },
                      sourceUrl: { type: 'string', example: 'https://patents.google.com/patent/US1001/en' },
                    },
                  },
                },
              },
            },
            sessionId: { type: 'string' },
          },
        },
        400: standardErrorResponses[400],
        500: standardErrorResponses[500],
      },
    },
    handler: (req: FastifyRequest, reply: FastifyReply) => controller.analyzePatentFeatures(req, reply),
  });
}
