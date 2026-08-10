import { z } from 'zod';
/**
 * Zod validation schema for POST /api/rag/analyze request payload.
 */
export const RagAnalysisRequestDtoSchema = z.object({
    query: z
        .string({
        message: 'query is required',
    })
        .trim()
        .min(1, 'query cannot be empty'),
    topK: z
        .number({
        message: 'topK must be a number',
    })
        .int('topK must be an integer')
        .min(1, 'topK must be at least 1')
        .max(100, 'maximum topK is 100')
        .optional()
        .default(10),
});
/**
 * Zod validation schema for POST /api/rag/deconstruct request payload.
 */
export const FeatureDeconstructionDtoSchema = z.object({
    query: z
        .string({
        message: 'query or text is required',
    })
        .trim()
        .min(1, 'query cannot be empty')
        .optional(),
    text: z.string().trim().min(1).optional(),
}).refine((data) => !!(data.query || data.text), {
    message: 'Either query or text must be provided',
});
/**
 * Zod schema for individual retrieved patent item returned in RAG response.
 */
export const RagRetrievedPatentDtoSchema = z.object({
    patentId: z.string(),
    title: z.string(),
    score: z.number(),
    ipc: z.string().optional(),
    abstract: z.string().optional(),
    section: z.string().optional(),
});
/**
 * Zod schema for similar patent item in novelty report.
 */
export const SimilarPatentItemDtoSchema = z.object({
    patentId: z.string(),
    reason: z.string(),
});
/**
 * Zod schema for feature comparison section.
 */
export const FeatureComparisonDtoSchema = z.object({
    commonFeatures: z.array(z.string()),
    uniqueFeatures: z.array(z.string()),
    partialOverlap: z.array(z.string()),
});
/**
 * Zod schema for 7-section AI novelty analysis result.
 */
export const NoveltyAnalysisResultDtoSchema = z.object({
    summary: z.string(),
    similarPatents: z.array(SimilarPatentItemDtoSchema),
    featureComparison: FeatureComparisonDtoSchema,
    novelAspects: z.array(z.string()),
    overlappingClaims: z.array(z.string()),
    risks: z.array(z.string()),
    recommendations: z.array(z.string()),
});
/**
 * Zod schema for relevant section item.
 */
export const RelevantSectionDtoSchema = z.object({
    section: z.string(),
    reason: z.string(),
});
/**
 * Zod schema for overlapping claim item.
 */
export const OverlappingClaimDtoSchema = z.object({
    claimNumber: z.union([z.number(), z.string()]).optional(),
    summary: z.string(),
    reason: z.string(),
    overlapStrength: z.enum(['High', 'Medium', 'Low']),
});
/**
 * Zod schema for overlap analysis item per retrieved patent.
 */
export const OverlapAnalysisItemDtoSchema = z.object({
    patentId: z.string(),
    title: z.string(),
    similarityScore: z.number(),
    relevantSections: z.array(RelevantSectionDtoSchema),
    overlappingClaims: z.array(OverlappingClaimDtoSchema),
});
export const RagConfidenceBlockDtoSchema = z.object({
    retrieval: z.object({ score: z.number(), level: z.string() }),
    analysis: z.object({ score: z.number(), level: z.string() }),
    overall: z.object({ score: z.number(), level: z.string() }),
});
export const RagAnalysisResponseDtoSchema = z.object({
    success: z.boolean(),
    query: z.string(),
    confidence: RagConfidenceBlockDtoSchema.optional(),
    retrievedPatents: z.array(RagRetrievedPatentDtoSchema).optional(),
    analysis: NoveltyAnalysisResultDtoSchema,
    overlapAnalysis: z.array(OverlapAnalysisItemDtoSchema).optional(),
});
/**
 * Legacy hybrid ranking DTO schema for backward compatibility.
 */
export const HybridRankingDtoSchema = z.object({
    queryText: z.string().min(1),
    topRawResults: z.number().optional().default(100),
    topRerankedResults: z.number().optional().default(20),
    weights: z
        .object({
        semantic: z.number().default(0.4),
        bm25: z.number().default(0.3),
        claimSimilarity: z.number().default(0.2),
        ipcMatch: z.number().default(0.1),
    })
        .optional(),
});
/**
 * Zod schema for POST /api/rag/design-around request payload.
 */
export const DesignAroundRequestDtoSchema = z
    .object({
    query: z.string().trim().optional(),
    text: z.string().trim().optional(),
    topK: z.number().int().min(1).max(100).optional().default(10),
    features: z
        .array(z.object({
        id: z.string().default('F1'),
        name: z.string().min(1),
        description: z.string().default(''),
    }))
        .optional(),
})
    .refine((data) => !!(data.query || data.text || (data.features && data.features.length > 0)), {
    message: 'At least one of query, text, or features array is required',
});
//# sourceMappingURL=rag.dto.js.map