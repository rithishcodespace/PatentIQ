import type { IJobProcessor, JobPayload } from './interfaces/job-processor.interface.js';
import type { IReportsService } from '../modules/reports/interfaces/reports-service.interface.js';
export interface ReportGenerationJobData {
    patentId: string;
    topPriorArtIds: string[];
}
export declare class ReportGenerationJob implements IJobProcessor<ReportGenerationJobData> {
    private readonly reportsService;
    constructor(reportsService: IReportsService);
    process(job: JobPayload<ReportGenerationJobData>): Promise<void>;
}
//# sourceMappingURL=report-generation.job.d.ts.map