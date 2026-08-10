import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import { env } from '../config/env.config.js';
import { UnauthorizedError } from '../common/errors/http-errors.js';
export default fp(async (fastify) => {
    await fastify.register(fastifyCookie);
    await fastify.register(fastifyJwt, {
        secret: env.JWT_SECRET,
        cookie: {
            cookieName: 'token',
            signed: false,
        },
    });
    fastify.decorate('authenticate', async (request, _reply) => {
        try {
            await request.jwtVerify();
        }
        catch {
            throw new UnauthorizedError('Authentication required. Invalid or missing session cookie.');
        }
    });
});
//# sourceMappingURL=auth.plugin.js.map