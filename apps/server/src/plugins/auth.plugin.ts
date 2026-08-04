import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.config.js';
import { UnauthorizedError } from '../common/errors/http-errors.js';


declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(fastifyCookie);
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      await request.jwtVerify({
        extractToken: (req) => req.cookies.token || req.headers.authorization?.replace(/^Bearer\s+/i, ''),
      });
    } catch {
      throw new UnauthorizedError('Authentication required. Invalid or missing session cookie.');
    }
  });
});

