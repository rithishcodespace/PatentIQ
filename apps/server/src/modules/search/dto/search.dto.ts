import { z } from 'zod';
import type { SearchRequest, SearchResponse, SearchResult, SearchFilter } from '../interfaces/search.interface.js';

const isoDateSchema = z
  .string()
  .trim()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Must be a valid ISO date string',
  });

/**
 * Zod validation schema for metadata-based search filters.
 */
export const SearchFilterDtoSchema = z
  .object({
    ipc: z.string({ message: 'IPC must be a string' }).trim().min(1, 'ipc cannot be empty').optional(),
    country: z.string({ message: 'Country must be a string' }).trim().min(1, 'country cannot be empty').optional(),
    publicationDate: isoDateSchema.optional(),
    publicationDateFrom: isoDateSchema.optional(),
    publicationDateTo: isoDateSchema.optional(),
    owner: z.string({ message: 'Owner must be a string' }).trim().min(1, 'owner cannot be empty').optional(),
    section: z
      .enum(['title', 'abstract', 'claims'], {
        message: 'Section must be one of: title, abstract, claims',
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.publicationDateFrom && data.publicationDateTo) {
        return new Date(data.publicationDateFrom) <= new Date(data.publicationDateTo);
      }
      return true;
    },
    {
      message: 'publicationDateFrom must be less than or equal to publicationDateTo',
      path: ['publicationDateFrom'],
    }
  );

export type SearchFilterDto = z.infer<typeof SearchFilterDtoSchema>;

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
  filters: SearchFilterDtoSchema.optional(),
});

export type SearchRequestDto = z.infer<typeof SearchRequestDtoSchema>;

/**
 * Zod validation schema for individual search result items.
 */
export const SearchResultDtoSchema = z.object({
  rank: z.number().int().min(1, 'rank must be a positive integer'),
  score: z.number({ message: 'score must be a number' }),
  patentId: z.string(),
  publicationNumber: z.string().optional(),
  title: z.string(),
  abstract: z.string(),
  claims: z.string().optional(),
  description: z.string().optional(),
  ipc: z.string(),
  cpc: z.string().optional(),
  country: z.string().optional(),
  owner: z.string().optional(),
  applicants: z.string().optional(),
  inventors: z.string().optional(),
  publicationDate: z.string().optional(),
  filingDate: z.string().optional(),
  priorityDate: z.string().optional(),
  section: z.string().optional(),
  sectionType: z.string().optional(),
  chunkId: z.string().optional(),
  claimNumber: z.number().optional(),
  vectorId: z.string().optional(),
  sourceUrl: z.string().optional(),
});

export type SearchResultDto = z.infer<typeof SearchResultDtoSchema>;

/**
 * Zod validation schema for top-level search response payload.
 */
export const SearchResponseDtoSchema = z.object({
  success: z.boolean(),
  query: z.string(),
  count: z.number(),
  filters: SearchFilterDtoSchema.optional(),
  confidence: z
    .object({
      retrieval: z.object({ score: z.number(), level: z.string() }),
      analysis: z.object({ score: z.number(), level: z.string() }).optional(),
      overall: z.object({ score: z.number(), level: z.string() }).optional(),
    })
    .optional(),
  results: z.array(SearchResultDtoSchema),
});

export type SearchResponseDto = z.infer<typeof SearchResponseDtoSchema>;

export type { SearchRequest, SearchResponse, SearchResult, SearchFilter };

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
 * Legacy DTO schema alias for compatibility.
 */
export const SearchQueryDtoSchema = SearchRequestDtoSchema;
export type SearchQueryDto = SearchRequestDto;

/**
 * Zod schema for POST /api/search/novelty-matrix request payload.
 */
export const ExtractedFeatureSchema = z.object({
  id: z.string().default('F1'),
  name: z.string().min(1, 'feature name cannot be empty'),
  description: z.string().default(''),
  category: z.string().optional(),
  importance: z.string().optional(),
});

export const NoveltyMatrixRequestDtoSchema = z
  .object({
    query: z.string().trim().optional(),
    text: z.string().trim().optional(),
    topK: z.number().int().min(1).max(100).optional().default(10),
    features: z.array(ExtractedFeatureSchema).optional(),
  })
  .refine((data) => !!(data.query || data.text || (data.features && data.features.length > 0)), {
    message: 'At least one of query, text, or features array is required',
  });

export type NoveltyMatrixRequestDto = z.infer<typeof NoveltyMatrixRequestDtoSchema>;
