import { z } from 'zod';
export declare const ReindexEmbeddingsDtoSchema: z.ZodObject<{
    forceAll: z.ZodDefault<z.ZodBoolean>;
    batchSize: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type ReindexEmbeddingsDto = z.infer<typeof ReindexEmbeddingsDtoSchema>;
export interface SystemStatusDto {
    pineconeHealthy: boolean;
    ollamaHealthy: boolean;
    databaseHealthy: boolean;
    pendingJobsCount: number;
}
//# sourceMappingURL=admin.dto.d.ts.map