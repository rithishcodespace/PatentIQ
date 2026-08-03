import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { RedisCacheProvider } from '../providers/cache/redis-cache.provider.js';
import type { ICacheProvider } from '../providers/cache/cache-provider.interface.js';

declare module 'fastify' {
  interface FastifyInstance {
    cache: ICacheProvider;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const cacheProvider = new RedisCacheProvider();
  fastify.decorate('cache', cacheProvider);
});
