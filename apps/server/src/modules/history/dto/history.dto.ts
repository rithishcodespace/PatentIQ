import { z } from 'zod';

/**
 * Zod Schema for History Filtering, Sorting, and Pagination Query Parameters
 */
export const HistoryQueryFilterDtoSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'searchQuery', 'totalResults', 'searchLatency']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  query: z.string().trim().optional(),
  ipc: z.string().trim().optional(),
  minScore: z.coerce.number().min(0).max(1).optional(),
  maxScore: z.coerce.number().min(0).max(1).optional(),
  userId: z.string().trim().optional(),
});

export type HistoryQueryFilterDto = z.infer<typeof HistoryQueryFilterDtoSchema>;

/**
 * Zod Schema for History Record ID Parameter
 */
export const HistoryParamIdDtoSchema = z.object({
  id: z.string().min(1, 'History ID is required'),
});

export type HistoryParamIdDto = z.infer<typeof HistoryParamIdDtoSchema>;

/**
 * DTO for creating a Retrieved Patent record
 */
export interface CreateRetrievedPatentDto {
  patentId: string;
  title: string;
  similarityScore: number;
  ipc?: string | null | undefined;
  country?: string | null | undefined;
  publicationDate?: Date | string | null | undefined;
  owner?: string | null | undefined;
  metadata?: Record<string, any> | null | undefined;
}

/**
 * DTO for creating a Search History record
 */
export interface CreateSearchHistoryDto {
  userId?: string | null;
  searchQuery: string;
  topK: number;
  appliedFilters?: Record<string, any> | null;
  totalResults: number;
  searchLatency: number;
  retrievedPatents?: CreateRetrievedPatentDto[];
}

/**
 * DTO for creating a Novelty Analysis record
 */
export interface CreateNoveltyAnalysisDto {
  searchHistoryId: string;
  summary: string;
  novelty: string;
  overlappingClaims: any;
  recommendations: any;
  confidenceScore: number;
  rawLLMResponse: string;
}

/**
 * DTO for saving full search and novelty analysis atomically
 */
export interface SaveCompleteSearchAndAnalysisDto {
  userId?: string | null;
  searchQuery: string;
  topK: number;
  appliedFilters?: Record<string, any> | null;
  totalResults: number;
  searchLatency: number;
  retrievedPatents: CreateRetrievedPatentDto[];
  noveltyAnalysis?: Omit<CreateNoveltyAnalysisDto, 'searchHistoryId'> | null;
}

/**
 * Response pagination metadata
 */
export interface HistoryPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated History List Response
 */
export interface HistoryListResponseDto {
  success: boolean;
  data: any[];
  meta: HistoryPaginationMeta;
}
