export interface AnalyticsOverviewDto {
    totalPatentsIngested: number;
    totalSearchesExecuted: number;
    totalReportsGenerated: number;
    avgSearchLatencyMs: number;
    topIpcClassifications: {
        ipc: string;
        count: number;
    }[];
}
//# sourceMappingURL=analytics.dto.d.ts.map