import { ResponseFormatter } from '../../../common/utils/response.formatter.js';
export class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getOverview(_request, reply) {
        const metrics = await this.analyticsService.getOverviewMetrics();
        reply.send(ResponseFormatter.success(metrics));
    }
}
//# sourceMappingURL=analytics.controller.js.map