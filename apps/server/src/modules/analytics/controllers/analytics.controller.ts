import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IAnalyticsService } from '../interfaces/analytics-service.interface.js';
import { ResponseFormatter } from '../../../common/utils/response.formatter.js';

export class AnalyticsController {
  constructor(private readonly analyticsService: IAnalyticsService) {}

  async getOverview(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const metrics = await this.analyticsService.getOverviewMetrics();
    reply.send(ResponseFormatter.success(metrics));
  }
}
