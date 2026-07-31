import { z } from 'zod';

/**
 * Zod validation schema for POST /api/search request payload.
 */
export const SearchRequestDtoSchema = z.object({
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

export type SearchRequestDto = z.infer<typeof SearchRequestDtoSchema>;

/**
 * Individual patent search result DTO.
 */
export interface SearchResultDto {
  patentId: string;
  title: string;
  abstract: string;
  ipc: string;
  score: number;
}

/**
 * HTTP Response DTO for POST /api/search.
 */
export interface SearchResponseDto {
  success: boolean;
  query: string;
  count: number;
  results: SearchResultDto[];
}

/**
 * Legacy DTO interface for prior art searches (e.g., RAG integration).
 */
export interface PriorArtMatchResult {
  patentId: string;
  patentNumber: string;
  title: string;
  abstract: string;
  similarityScore: number;
  ipcClassifications: string[];
}

/**
 * Legacy DTO alias for compatibility.
 */
export const SearchQueryDtoSchema = SearchRequestDtoSchema;
export type SearchQueryDto = SearchRequestDto;
