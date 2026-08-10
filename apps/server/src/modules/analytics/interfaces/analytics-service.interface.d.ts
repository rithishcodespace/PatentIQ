import type { AnalyticsOverviewDto } from '../dto/analytics.dto.js';
export interface IAnalyticsService {
    getOverviewMetrics(): Promise<AnalyticsOverviewDto>;
    trackSearchQuery(query: string, durationMs: number): Promise<void>;
}
//# sourceMappingURL=analytics-service.interface.d.ts.map