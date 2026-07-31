import { z } from 'zod';
import type {
  RagAnalysisRequest,
  RagAnalysisResponse,
  RagAnalysisResult,
  RagRetrievedPatent,
} from '../interfaces/rag.interface.js';

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

export type RagAnalysisRequestDto = z.infer<typeof RagAnalysisRequestDtoSchema>;

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

export type RagRetrievedPatentDto = z.infer<typeof RagRetrievedPatentDtoSchema>;

/**
 * Zod schema for AI novelty analysis result.
 */
export const RagAnalysisResultDtoSchema = z.object({
  summary: z.string(),
  similarPatents: z.string(),
  novelty: z.string(),
  overlappingClaims: z.string(),
  recommendations: z.string(),
});

export type RagAnalysisResultDto = z.infer<typeof RagAnalysisResultDtoSchema>;

/**
 * Zod schema for full RAG response payload.
 */
export const RagAnalysisResponseDtoSchema = z.object({
  success: z.boolean(),
  query: z.string(),
  retrievedPatents: z.array(RagRetrievedPatentDtoSchema),
  analysis: RagAnalysisResultDtoSchema,
});

export type RagAnalysisResponseDto = z.infer<typeof RagAnalysisResponseDtoSchema>;

export type { RagAnalysisRequest, RagAnalysisResponse, RagAnalysisResult, RagRetrievedPatent };

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

export type HybridRankingDto = z.infer<typeof HybridRankingDtoSchema>;

export interface RankedPatentCandidate {
  patentId: string;
  combinedScore: number;
  semanticScore: number;
  bm25Score: number;
  claimScore: number;
  ipcScore: number;
}
