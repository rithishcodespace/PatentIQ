import type { IJobProcessor, JobPayload } from './interfaces/job-processor.interface.js';
import type { IReportsService } from '../modules/reports/interfaces/reports-service.interface.js';

export interface ReportGenerationJobData {
  patentId: string;
  topPriorArtIds: string[];
}

export class ReportGenerationJob implements IJobProcessor<ReportGenerationJobData> {
  constructor(private readonly reportsService: IReportsService) {}

  async process(job: JobPayload<ReportGenerationJobData>): Promise<void> {
    console.log(`[ReportGenerationJob] Processing job ${job.jobId} for patent ${job.data.patentId}`);
    await this.reportsService.generateReport({
      patentId: job.data.patentId,
      topPriorArtIds: job.data.topPriorArtIds,
    });
  }
}
