import { AnalyticsController } from '../controllers/analytics.controller.js';
import { standardErrorResponses } from '../../../common/schemas/swagger.schemas.js';
export async function analyticsRoutes(fastify, controller) {
    // GET /overview - Analytics overview
    fastify.get('/overview', {
        schema: {
            tags: ['Analytics'],
            summary: 'Get Search & System Analytics Overview',
            description: 'Returns total search queries count, average search latency, top IPC categories, and search volume stats.',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        totalSearches: { type: 'integer', example: 1250 },
                        averageLatencyMs: { type: 'number', example: 142.5 },
                        topCategories: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    ipc: { type: 'string', example: 'H02J' },
                                    count: { type: 'integer', example: 340 },
                                },
                            },
                        },
                    },
                },
                500: standardErrorResponses[500],
            },
        },
        handler: (req, reply) => controller.getOverview(req, reply),
    });
}
//# sourceMappingURL=analytics.routes.js.map