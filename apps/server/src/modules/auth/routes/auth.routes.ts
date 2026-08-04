import type { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';
import {
  AuthRegisterRequestSchema,
  AuthLoginRequestSchema,
  standardErrorResponses,
} from '../../../common/schemas/swagger.schemas.js';

export async function authRoutes(fastify: FastifyInstance, controller: AuthController): Promise<void> {
  // POST /register - Register new user
  fastify.post('/register', {
    schema: {
      tags: ['Authentication'],
      summary: 'Register User',
      description: 'Creates a new user account and sets HTTP-only session cookie.',
      body: AuthRegisterRequestSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        400: standardErrorResponses[400],
        409: standardErrorResponses[409],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.register(req as any, reply),
  });

  // POST /login - User login
  fastify.post('/login', {
    schema: {
      tags: ['Authentication'],
      summary: 'User Login',
      description: 'Authenticates user credentials and sets HTTP-only session cookie.',
      body: AuthLoginRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        400: standardErrorResponses[400],
        401: standardErrorResponses[401],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.login(req as any, reply),
  });

  // POST /logout - User logout
  fastify.post('/logout', {
    schema: {
      tags: ['Authentication'],
      summary: 'User Logout',
      description: 'Clears active session cookie.',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Successfully logged out' },
          },
        },
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.logout(req, reply),
  });

  // GET /me - Get current authenticated user
  fastify.get('/me', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['Authentication'],
      summary: 'Current User Profile',
      description: 'Fetches profile of currently authenticated user via session cookie.',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        401: standardErrorResponses[401],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.getMe(req, reply),
  });
}

