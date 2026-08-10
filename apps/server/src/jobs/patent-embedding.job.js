export class PatentEmbeddingJob {
    embeddingsService;
    constructor(embeddingsService) {
        this.embeddingsService = embeddingsService;
    }
    async process(job) {
        console.log(`[PatentEmbeddingJob] Processing job ${job.jobId} for patent ${job.data.patentId}`);
        for (const section of job.data.sections) {
            await this.embeddingsService.generateAndStoreEmbedding({
                text: section.content,
                patentId: job.data.patentId,
                section: section.name,
            });
        }
    }
}
//# sourceMappingURL=patent-embedding.job.js.map