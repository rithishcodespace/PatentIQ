import type { FastifyInstance } from 'fastify';
import { UsersController } from '../controllers/users.controller.js';

export async function usersRoutes(fastify: FastifyInstance, controller: UsersController): Promise<void> {
  fastify.get('/:id', (req, reply) => controller.getProfile(req as any, reply));
  fastify.put('/:id', (req, reply) => controller.updateProfile(req as any, reply));
  fastify.delete('/:id', (req, reply) => controller.deleteProfile(req as any, reply));
}
