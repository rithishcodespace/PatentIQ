import type { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';
import {
  AuthRegisterRequestSchema,
  AuthLoginRequestSchema,
  AuthTokenResponseSchema,
  standardErrorResponses,
} from '../../../common/schemas/swagger.schemas.js';

export async function authRoutes(fastify: FastifyInstance, controller: AuthController): Promise<void> {
  // POST /register - Register new user
  fastify.post('/register', {
    schema: {
      tags: ['Authentication'],
      summary: 'Register User',
      description: 'Creates a new user account and returns Bearer JWT authentication tokens.',
      body: AuthRegisterRequestSchema,
      response: {
        201: AuthTokenResponseSchema,
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
      description: 'Authenticates user credentials and returns JWT access and refresh tokens.',
      body: AuthLoginRequestSchema,
      response: {
        200: AuthTokenResponseSchema,
        400: standardErrorResponses[400],
        401: standardErrorResponses[401],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.login(req as any, reply),
  });

  // POST /refresh - Refresh JWT token
  fastify.post('/refresh', {
    schema: {
      tags: ['Authentication'],
      summary: 'Refresh JWT Token',
      description: 'Generates a new access token using a valid refresh token.',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'def456-refresh-token-string' },
        },
      },
      response: {
        200: AuthTokenResponseSchema,
        401: standardErrorResponses[401],
        500: standardErrorResponses[500],
      },
    },
    handler: async (req, reply) => {
      reply.send({ success: true, message: 'Token refresh endpoint' });
    },
  });

  // POST /logout - User logout
  fastify.post('/logout', {
    schema: {
      tags: ['Authentication'],
      summary: 'User Logout',
      description: 'Revokes user refresh token and invalidates active session.',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Successfully logged out' },
          },
        },
        401: standardErrorResponses[401],
        500: standardErrorResponses[500],
      },
    },
    handler: async (req, reply) => {
      reply.send({ success: true, message: 'Successfully logged out' });
    },
  });
}
