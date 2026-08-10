import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IAnalyticsService } from '../interfaces/analytics-service.interface.js';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: IAnalyticsService);
    getOverview(_request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=analytics.controller.d.ts.map