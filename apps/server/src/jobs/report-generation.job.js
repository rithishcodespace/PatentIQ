export class ReportGenerationJob {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async process(job) {
        console.log(`[ReportGenerationJob] Processing job ${job.jobId} for patent ${job.data.patentId}`);
        await this.reportsService.generateReport({
            patentId: job.data.patentId,
            topPriorArtIds: job.data.topPriorArtIds,
        });
    }
}
//# sourceMappingURL=report-generation.job.js.map