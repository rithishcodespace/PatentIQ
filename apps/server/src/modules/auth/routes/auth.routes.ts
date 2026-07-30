import type { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';
import { RegisterDtoSchema, LoginDtoSchema } from '../dto/auth.dto.js';

export async function authRoutes(fastify: FastifyInstance, controller: AuthController): Promise<void> {
  fastify.post('/register', {
    schema: {
      body: RegisterDtoSchema,
    },
    handler: (req, reply) => controller.register(req as any, reply),
  });

  fastify.post('/login', {
    schema: {
      body: LoginDtoSchema,
    },
    handler: (req, reply) => controller.login(req as any, reply),
  });
}
