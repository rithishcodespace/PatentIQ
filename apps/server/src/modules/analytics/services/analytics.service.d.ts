import { PrismaClient } from '@prisma/client';
import type { IAnalyticsService } from '../interfaces/analytics-service.interface.js';
import type { AnalyticsOverviewDto } from '../dto/analytics.dto.js';
import type { ICacheProvider } from '../../../providers/cache/cache-provider.interface.js';
export declare class AnalyticsService implements IAnalyticsService {
    private prisma;
    private cacheProvider;
    private static readonly CACHE_KEY;
    private static readonly CACHE_TTL_SEC;
    constructor(prisma?: PrismaClient, cacheProvider?: ICacheProvider);
    /**
     * Retrieves aggregated search metrics, execution times, and top IPC distributions
     * from PostgreSQL with Redis caching.
     */
    getOverviewMetrics(): Promise<AnalyticsOverviewDto>;
    /**
     * Tracks search query execution metrics and invalidates cache if necessary.
     */
    trackSearchQuery(query: string, durationMs: number): Promise<void>;
}
//# sourceMappingURL=analytics.service.d.ts.map