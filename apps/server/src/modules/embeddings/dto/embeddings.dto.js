import { z } from 'zod';
export const GenerateEmbeddingDtoSchema = z.object({
    text: z.string().min(1),
    patentId: z.string().optional(),
    section: z.enum(['title', 'abstract', 'claims', 'description']).optional(),
});
export const BatchGenerateEmbeddingDtoSchema = z.object({
    texts: z.array(z.string()),
    patentId: z.string().optional(),
});
//# sourceMappingURL=embeddings.dto.js.map