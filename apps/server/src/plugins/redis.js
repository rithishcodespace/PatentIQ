import fp from 'fastify-plugin';
import { RedisCacheProvider } from '../providers/cache/redis-cache.provider.js';
export default fp(async (fastify) => {
    const cacheProvider = new RedisCacheProvider();
    fastify.decorate('cache', cacheProvider);
});
//# sourceMappingURL=redis.js.map