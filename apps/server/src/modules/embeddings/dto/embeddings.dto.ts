import { z } from 'zod';

export const GenerateEmbeddingDtoSchema = z.object({
  text: z.string().min(1),
  patentId: z.string().optional(),
  section: z.enum(['title', 'abstract', 'claims', 'description']).optional(),
});

export type GenerateEmbeddingDto = z.infer<typeof GenerateEmbeddingDtoSchema>;

export const BatchGenerateEmbeddingDtoSchema = z.object({
  texts: z.array(z.string()),
  patentId: z.string().optional(),
});

export type BatchGenerateEmbeddingDto = z.infer<typeof BatchGenerateEmbeddingDtoSchema>;
