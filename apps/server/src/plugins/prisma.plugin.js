import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { databaseConfig } from '../config/database.config.js';
export default fp(async (fastify) => {
    const pool = new pg.Pool({ connectionString: databaseConfig.url });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    fastify.decorate('prisma', prisma);
    fastify.addHook('onClose', async (instance) => {
        await instance.prisma.$disconnect();
        await pool.end();
    });
});
//# sourceMappingURL=prisma.plugin.js.map