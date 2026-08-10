import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/app-error.js';
export declare function errorHandler(error: FastifyError | AppError, request: FastifyRequest, reply: FastifyReply): void;
//# sourceMappingURL=error.handler.d.ts.map