import type { IJobProcessor, JobPayload } from './interfaces/job-processor.interface.js';
import type { IEmbeddingsService } from '../modules/embeddings/interfaces/embeddings-service.interface.js';
export interface PatentEmbeddingJobData {
    patentId: string;
    sections: {
        name: 'title' | 'abstract' | 'claims';
        content: string;
    }[];
}
export declare class PatentEmbeddingJob implements IJobProcessor<PatentEmbeddingJobData> {
    private readonly embeddingsService;
    constructor(embeddingsService: IEmbeddingsService);
    process(job: JobPayload<PatentEmbeddingJobData>): Promise<void>;
}
//# sourceMappingURL=patent-embedding.job.d.ts.map