import { z } from 'zod';
export const ConfidenceLevelSchema = z.enum(['Very High', 'High', 'Medium', 'Low', 'Very Low']);
export const ConfidenceScoreItemDtoSchema = z.object({
    score: z.number().min(0).max(100),
    level: ConfidenceLevelSchema,
});
export const FullConfidenceDtoSchema = z.object({
    retrieval: ConfidenceScoreItemDtoSchema,
    analysis: ConfidenceScoreItemDtoSchema,
    overall: ConfidenceScoreItemDtoSchema,
});
//# sourceMappingURL=confidence.dto.js.map