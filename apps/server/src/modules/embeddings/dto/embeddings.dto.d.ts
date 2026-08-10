import { z } from 'zod';
export declare const GenerateEmbeddingDtoSchema: z.ZodObject<{
    text: z.ZodString;
    patentId: z.ZodOptional<z.ZodString>;
    section: z.ZodOptional<z.ZodEnum<{
        abstract: "abstract";
        claims: "claims";
        description: "description";
        title: "title";
    }>>;
}, z.core.$strip>;
export type GenerateEmbeddingDto = z.infer<typeof GenerateEmbeddingDtoSchema>;
export declare const BatchGenerateEmbeddingDtoSchema: z.ZodObject<{
    texts: z.ZodArray<z.ZodString>;
    patentId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type BatchGenerateEmbeddingDto = z.infer<typeof BatchGenerateEmbeddingDtoSchema>;
//# sourceMappingURL=embeddings.dto.d.ts.map