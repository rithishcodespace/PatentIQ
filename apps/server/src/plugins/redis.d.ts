import type { FastifyInstance } from 'fastify';
import type { ICacheProvider } from '../providers/cache/cache-provider.interface.js';
declare module 'fastify' {
    interface FastifyInstance {
        cache: ICacheProvider;
    }
}
declare const _default: (fastify: FastifyInstance) => Promise<void>;
export default _default;
//# sourceMappingURL=redis.d.ts.map