import type { FastifyReply, FastifyRequest } from 'fastify';
import { UnauthorizedError } from '../errors/http-errors.js';

export async function authMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('Authorization token required');
    }
  } catch (err) {
    throw new UnauthorizedError('Invalid authentication credentials');
  }
}
