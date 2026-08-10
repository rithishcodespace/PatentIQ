import { PrismaClient } from '@prisma/client';
import { RedisCacheProvider } from '../../../providers/cache/redis-cache.provider.js';
export class AnalyticsService {
    prisma;
    cacheProvider;
    static CACHE_KEY = 'analytics:overview';
    static CACHE_TTL_SEC = 60;
    constructor(prisma, cacheProvider) {
        this.prisma = prisma || new PrismaClient();
        this.cacheProvider = cacheProvider || new RedisCacheProvider();
    }
    /**
     * Retrieves aggregated search metrics, execution times, and top IPC distributions
     * from PostgreSQL with Redis caching.
     */
    async getOverviewMetrics() {
        // 1. Try Redis cache first
        try {
            const cachedMetrics = await this.cacheProvider.get(AnalyticsService.CACHE_KEY);
            if (cachedMetrics) {
                return cachedMetrics;
            }
        }
        catch {
            // Ignore cache read errors
        }
        // 2. Query PostgreSQL aggregated metrics concurrently
        const [patentsCount, uploadedDocsCount, searchesCount, reportsCount, avgLatencyResult, topIpcRaw] = await Promise.all([
            this.prisma.patent.count().catch(() => 0),
            this.prisma.uploadedDocument.count().catch(() => 0),
            this.prisma.searchHistory.count().catch(() => 0),
            this.prisma.noveltyAnalysis.count().catch(() => 0),
            this.prisma.searchHistory.aggregate({
                _avg: {
                    searchLatency: true,
                },
            }).catch(() => ({ _avg: { searchLatency: null } })),
            this.prisma.retrievedPatent.findMany({
                select: { ipc: true },
                where: { ipc: { not: null } },
                take: 1000,
            }).catch(() => []),
        ]);
        const totalPatentsIngested = Math.max(patentsCount, uploadedDocsCount);
        const totalSearchesExecuted = searchesCount;
        const totalReportsGenerated = reportsCount;
        const rawAvg = avgLatencyResult._avg?.searchLatency;
        const avgSearchLatencyMs = rawAvg != null ? Math.round(rawAvg) : 0;
        // Aggregate IPC counts from retrieved patents or patents table
        const ipcCountMap = new Map();
        for (const record of topIpcRaw) {
            if (record.ipc) {
                const mainIpc = record.ipc.split(' ')[0]?.trim() || record.ipc.trim();
                if (mainIpc) {
                    ipcCountMap.set(mainIpc, (ipcCountMap.get(mainIpc) || 0) + 1);
                }
            }
        }
        // Fallback: If retrieved patents table has no IPCs yet, query patents table
        if (ipcCountMap.size === 0) {
            try {
                const patentsWithIpc = await this.prisma.patent.findMany({
                    select: { ipcClassifications: true },
                    take: 500,
                });
                for (const p of patentsWithIpc) {
                    for (const ipc of p.ipcClassifications) {
                        const mainIpc = ipc.split(' ')[0]?.trim() || ipc.trim();
                        if (mainIpc) {
                            ipcCountMap.set(mainIpc, (ipcCountMap.get(mainIpc) || 0) + 1);
                        }
                    }
                }
            }
            catch {
                // Ignore fallback errors
            }
        }
        // Sort by frequency descending and format top 5 classifications
        const topIpcClassifications = Array.from(ipcCountMap.entries())
            .map(([ipc, count]) => ({ ipc, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const overviewMetrics = {
            totalPatentsIngested,
            totalSearchesExecuted,
            totalReportsGenerated,
            avgSearchLatencyMs,
            topIpcClassifications,
        };
        // 3. Store in Redis cache
        try {
            await this.cacheProvider.set(AnalyticsService.CACHE_KEY, overviewMetrics, AnalyticsService.CACHE_TTL_SEC);
        }
        catch {
            // Ignore cache write errors
        }
        return overviewMetrics;
    }
    /**
     * Tracks search query execution metrics and invalidates cache if necessary.
     */
    async trackSearchQuery(query, durationMs) {
        console.log(`[AnalyticsService] Tracked search query: "${query}" (${durationMs}ms)`);
        try {
            await this.cacheProvider.del(AnalyticsService.CACHE_KEY);
        }
        catch {
            // Ignore cache delete errors
        }
    }
}
//# sourceMappingURL=analytics.service.js.map