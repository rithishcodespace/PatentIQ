import type { FastifyInstance } from 'fastify';
import { UsersController } from '../controllers/users.controller.js';
import { standardErrorResponses } from '../../../common/schemas/swagger.schemas.js';

export async function usersRoutes(fastify: FastifyInstance, controller: UsersController): Promise<void> {
  // GET /api/v1/users/:id - Get user profile
  fastify.get('/:id', {
    schema: {
      tags: ['Users'],
      summary: 'Get User Profile by ID',
      description: 'Retrieves public user profile information by user ID.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', example: 'usr-12345' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'usr-12345' },
                email: { type: 'string', example: 'developer@patentiq.ai' },
                name: { type: 'string', example: 'Dr. Jane Doe' },
                createdAt: { type: 'string', format: 'date-time', example: '2026-08-01T00:00:00.000Z' },
              },
            },
          },
        },
        401: standardErrorResponses[401],
        404: standardErrorResponses[404],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.getProfile(req as any, reply),
  });

  // PUT /api/v1/users/:id - Update user profile
  fastify.put('/:id', {
    schema: {
      tags: ['Users'],
      summary: 'Update User Profile',
      description: 'Updates account profile information for a specified user ID.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', example: 'usr-12345' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Dr. Jane Smith' },
          email: { type: 'string', format: 'email', example: 'janesmith@patentiq.ai' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Profile updated successfully' },
          },
        },
        400: standardErrorResponses[400],
        401: standardErrorResponses[401],
        404: standardErrorResponses[404],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.updateProfile(req as any, reply),
  });

  // DELETE /api/v1/users/:id - Delete user account
  fastify.delete('/:id', {
    schema: {
      tags: ['Users'],
      summary: 'Delete User Account',
      description: 'Permanently deletes user account and revokes access credentials.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', example: 'usr-12345' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User account deleted' },
          },
        },
        401: standardErrorResponses[401],
        404: standardErrorResponses[404],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.deleteProfile(req as any, reply),
  });
}
