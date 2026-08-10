import { z } from 'zod';
export const ReindexEmbeddingsDtoSchema = z.object({
    forceAll: z.boolean().default(false),
    batchSize: z.number().default(50),
});
//# sourceMappingURL=admin.dto.js.map