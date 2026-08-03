import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    allowList: ['/health', '/health/postgres', '/health/pinecone', '/health/ollama'],
    errorResponseBuilder: (_request, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Maximum ${context.max} requests allowed per ${context.after}. Please try again later.`,
      date: new Date().toISOString(),
      expiresIn: context.ttl,
    }),
  });
});
