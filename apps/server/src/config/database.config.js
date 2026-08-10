import { env } from './env.config.js';
export const databaseConfig = {
    url: env.DATABASE_URL,
    maxConnections: 20,
    idleTimeoutMillis: 30000,
};
//# sourceMappingURL=database.config.js.map