import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { databaseConfig } from '../config/database.config.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const pool = new pg.Pool({ connectionString: databaseConfig.url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
    await pool.end();
  });
});
