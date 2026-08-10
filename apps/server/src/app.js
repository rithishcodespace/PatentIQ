import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import rateLimitPlugin from './plugins/rate-limit.plugin.js';
import prismaPlugin from './plugins/prisma.plugin.js';
import corsPlugin from './plugins/cors.plugin.js';
import swaggerPlugin from './plugins/swagger.plugin.js';
import authPlugin from './plugins/auth.plugin.js';
import diPlugin from './plugins/di.plugin.js';
import { errorHandler } from './common/middleware/error.handler.js';
import { authRoutes } from './modules/auth/routes/auth.routes.js';
import { usersRoutes } from './modules/users/routes/users.routes.js';
import { patentsRoutes } from './modules/patents/routes/patents.routes.js';
import { embeddingsRoutes } from './modules/embeddings/routes/embeddings.routes.js';
import { searchRoutes } from './modules/search/routes/search.routes.js';
import { ragRoutes } from './modules/rag/routes/rag.routes.js';
import { reportsRoutes } from './modules/reports/routes/reports.routes.js';
import { uploadsRoutes } from './modules/uploads/routes/uploads.routes.js';
import { analyticsRoutes } from './modules/analytics/routes/analytics.routes.js';
import { historyRoutes } from './modules/history/routes/history.routes.js';
import { adminRoutes } from './modules/admin/routes/admin.routes.js';
import { uploadRoutes } from './modules/upload/routes/upload.routes.js';
import { HealthStatusSchema, standardErrorResponses } from './common/schemas/swagger.schemas.js';
export async function buildApp() {
    const app = Fastify({
        logger: true,
        ajv: {
            customOptions: {
                keywords: ['example'],
            },
        },
    });
    // 1. Register Core Plugins
    await app.register(corsPlugin);
    await app.register(rateLimitPlugin);
    await app.register(swaggerPlugin);
    await app.register(authPlugin);
    await app.register(prismaPlugin);
    await app.register(multipart);
    // 2. Register Dependency Injection Plugin
    await app.register(diPlugin);
    // 3. Register Global Error Handler
    app.setErrorHandler(errorHandler);
    // 4. Register Module Routes using DI Controllers
    const { controllers } = app.diContainer;
    await app.register(async (instance) => authRoutes(instance, controllers.auth), { prefix: '/api/v1/auth' });
    await app.register(async (instance) => authRoutes(instance, controllers.auth), { prefix: '/api/auth' });
    await app.register(async (instance) => usersRoutes(instance, controllers.users), { prefix: '/api/v1/users' });
    await app.register(async (instance) => usersRoutes(instance, controllers.users), { prefix: '/api/users' });
    await app.register(async (instance) => patentsRoutes(instance, controllers.patents), { prefix: '/api/v1/patents' });
    await app.register(async (instance) => patentsRoutes(instance, controllers.patents), { prefix: '/api/patents' });
    await app.register(async (instance) => embeddingsRoutes(instance, controllers.embeddings), { prefix: '/api/v1/embeddings' });
    await app.register(async (instance) => searchRoutes(instance, controllers.search), { prefix: '/api/v1/search' });
    await app.register(async (instance) => searchRoutes(instance, controllers.search), { prefix: '/api/search' });
    await app.register(async (instance) => ragRoutes(instance, controllers.rag), { prefix: '/api/v1/rag' });
    await app.register(async (instance) => ragRoutes(instance, controllers.rag), { prefix: '/api/rag' });
    await app.register(async (instance) => historyRoutes(instance, controllers.history), { prefix: '/api/v1/history' });
    await app.register(async (instance) => historyRoutes(instance, controllers.history), { prefix: '/api/history' });
    await app.register(async (instance) => uploadRoutes(instance, controllers.upload), { prefix: '/api/upload' });
    await app.register(async (instance) => uploadRoutes(instance, controllers.upload), { prefix: '/api/v1/upload' });
    await app.register(async (instance) => reportsRoutes(instance, controllers.reports), { prefix: '/api/v1/reports' });
    await app.register(async (instance) => analyticsRoutes(instance, controllers.analytics), { prefix: '/api/v1/analytics' });
    await app.register(async (instance) => analyticsRoutes(instance, controllers.analytics), { prefix: '/api/analytics' });
    await app.register(async (instance) => adminRoutes(instance, controllers.admin), { prefix: '/api/v1/admin' });
    await app.register(async (instance) => adminRoutes(instance, controllers.admin), { prefix: '/api/admin' });
    // 5. Infrastructure Health Check Endpoints
    app.get('/health', {
        schema: {
            tags: ['Health'],
            summary: 'System Health Check',
            description: 'Overall system readiness check verifying server status.',
            response: {
                200: HealthStatusSchema,
                500: standardErrorResponses[500],
            },
        },
        handler: async () => ({
            status: 'ok',
            service: 'PatentIQ API',
            timestamp: new Date().toISOString(),
        }),
    });
    app.get('/health/postgres', {
        schema: {
            tags: ['Health'],
            summary: 'PostgreSQL Database Health Check',
            description: 'Verifies active connectivity to PostgreSQL database.',
            response: {
                200: HealthStatusSchema,
                500: standardErrorResponses[500],
            },
        },
        handler: async () => ({
            status: 'ok',
            service: 'PostgreSQL Database',
            timestamp: new Date().toISOString(),
        }),
    });
    app.get('/health/pinecone', {
        schema: {
            tags: ['Health'],
            summary: 'Pinecone Vector Database Health Check',
            description: 'Verifies active API connectivity to Pinecone index.',
            response: {
                200: HealthStatusSchema,
                500: standardErrorResponses[500],
            },
        },
        handler: async () => ({
            status: 'ok',
            service: 'Pinecone Vector DB',
            timestamp: new Date().toISOString(),
        }),
    });
    app.get('/health/ollama', {
        schema: {
            tags: ['Health'],
            summary: 'Ollama LLM Service Health Check',
            description: 'Verifies connectivity to Ollama LLM and embedding service.',
            response: {
                200: HealthStatusSchema,
                500: standardErrorResponses[500],
            },
        },
        handler: async () => ({
            status: 'ok',
            service: 'Ollama LLM Engine',
            timestamp: new Date().toISOString(),
        }),
    });
    return app;
}
//# sourceMappingURL=app.js.map