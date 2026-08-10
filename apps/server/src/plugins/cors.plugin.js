import fp from 'fastify-plugin';
import cors from '@fastify/cors';
export default fp(async (fastify) => {
    await fastify.register(cors, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
});
//# sourceMappingURL=cors.plugin.js.map