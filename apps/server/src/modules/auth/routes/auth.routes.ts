import type { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';

export async function authRoutes(fastify: FastifyInstance, controller: AuthController): Promise<void> {
  fastify.post('/register', (req, reply) => controller.register(req as any, reply));
  fastify.post('/login', (req, reply) => controller.login(req as any, reply));
}
