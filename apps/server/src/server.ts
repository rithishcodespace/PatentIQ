import { buildApp } from './app.js';
import { env } from './config/env.config.js';
import { logger } from './common/utils/logger.js';

async function startServer() {
  try {
    const app = await buildApp();
    await app.listen({ port: env.PORT, host: env.HOST });
    logger.info(`Server running on http://${env.HOST}:${env.PORT}`);
    logger.info(`Swagger API docs available on http://${env.HOST}:${env.PORT}/docs`);
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

startServer();
