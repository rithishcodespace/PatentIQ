import type { IJobProcessor, JobPayload } from './interfaces/job-processor.interface.js';
import type { IEmbeddingsService } from '../modules/embeddings/interfaces/embeddings-service.interface.js';

export interface PatentEmbeddingJobData {
  patentId: string;
  sections: { name: 'title' | 'abstract' | 'claims'; content: string }[];
}

export class PatentEmbeddingJob implements IJobProcessor<PatentEmbeddingJobData> {
  constructor(private readonly embeddingsService: IEmbeddingsService) {}

  async process(job: JobPayload<PatentEmbeddingJobData>): Promise<void> {
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
