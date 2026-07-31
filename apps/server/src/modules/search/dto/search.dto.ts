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
 * DTO aliases for clean type imports.
 */
export type SearchResultDto = SearchResult;
export type SearchResponseDto = SearchResponse;
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
