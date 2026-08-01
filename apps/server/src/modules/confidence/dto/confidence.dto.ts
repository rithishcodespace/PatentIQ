import { z } from 'zod';
import type { ConfidenceLevel } from '../interfaces/confidence.interface.js';

export const ConfidenceLevelSchema = z.enum(['Very High', 'High', 'Medium', 'Low', 'Very Low']);

export const ConfidenceScoreItemDtoSchema = z.object({
  score: z.number().min(0).max(100),
  level: ConfidenceLevelSchema,
});

export type ConfidenceScoreItemDto = z.infer<typeof ConfidenceScoreItemDtoSchema>;

export const FullConfidenceDtoSchema = z.object({
  retrieval: ConfidenceScoreItemDtoSchema,
  analysis: ConfidenceScoreItemDtoSchema,
  overall: ConfidenceScoreItemDtoSchema,
});

export type FullConfidenceDto = z.infer<typeof FullConfidenceDtoSchema>;
