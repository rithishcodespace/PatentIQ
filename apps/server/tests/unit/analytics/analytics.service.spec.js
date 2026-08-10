import { describe, it, expect, vi } from 'vitest';
import { AnalyticsService } from '../../../src/modules/analytics/services/analytics.service.js';
describe('AnalyticsService Unit Tests', () => {
    const mockPrisma = {
        patent: {
            count: vi.fn().mockResolvedValue(120),
            findMany: vi.fn().mockResolvedValue([
                { ipcClassifications: ['G06F 17/30', 'H04L 29/06'] },
            ]),
        },
        uploadedDocument: {
            count: vi.fn().mockResolvedValue(50),
        },
        searchHistory: {
            count: vi.fn().mockResolvedValue(85),
            aggregate: vi.fn().mockResolvedValue({
                _avg: { searchLatency: 142 },
            }),
        },
        noveltyAnalysis: {
            count: vi.fn().mockResolvedValue(40),
        },
        retrievedPatent: {
            findMany: vi.fn().mockResolvedValue([
                { ipc: 'G06F 17/30' },
                { ipc: 'G06F 15/00' },
                { ipc: 'H04L 29/06' },
            ]),
        },
    };
    const mockCacheProvider = {
        isAvailable: vi.fn().mockReturnValue(true),
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(undefined),
        del: vi.fn().mockResolvedValue(undefined),
        flush: vi.fn().mockResolvedValue(undefined),
    };
    const analyticsService = new AnalyticsService(mockPrisma, mockCacheProvider);
    it('should query aggregated search metrics, execution times, and query distribution from PostgreSQL', async () => {
        const metrics = await analyticsService.getOverviewMetrics();
        expect(metrics.totalPatentsIngested).toBe(120);
        expect(metrics.totalSearchesExecuted).toBe(85);
        expect(metrics.totalReportsGenerated).toBe(40);
        expect(metrics.avgSearchLatencyMs).toBe(142);
        expect(metrics.topIpcClassifications.length).toBeGreaterThan(0);
        expect(metrics.topIpcClassifications[0]?.ipc).toBe('G06F');
    });
    it('should invalidate cache when tracking new search query', async () => {
        await analyticsService.trackSearchQuery('Autonomous drone', 120);
        expect(mockCacheProvider.del).toHaveBeenCalledWith('analytics:overview');
    });
});
//# sourceMappingURL=analytics.service.spec.js.map