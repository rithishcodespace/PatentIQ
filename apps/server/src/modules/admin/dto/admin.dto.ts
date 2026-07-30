import { z } from 'zod';

export const ReindexEmbeddingsDtoSchema = z.object({
  forceAll: z.boolean().default(false),
  batchSize: z.number().default(50),
});

export type ReindexEmbeddingsDto = z.infer<typeof ReindexEmbeddingsDtoSchema>;

export interface SystemStatusDto {
  pineconeHealthy: boolean;
  ollamaHealthy: boolean;
  databaseHealthy: boolean;
  pendingJobsCount: number;
}
