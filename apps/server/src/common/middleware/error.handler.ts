import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/app-error.js';

export function errorHandler(
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      message: error.message,
      error: error.name,
    });
    return;
  }

  request.log.error(error);

  reply.status((error as FastifyError).statusCode || 500).send({
    success: false,
    message: error.message || 'Internal Server Error',
    error: 'InternalServerError',
  });
}
