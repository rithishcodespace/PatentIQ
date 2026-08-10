import { z } from 'zod';
/**
 * Zod Schema for History Filtering, Sorting, and Pagination Query Parameters
 */
export declare const HistoryQueryFilterDtoSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodDefault<z.ZodEnum<{
        createdAt: "createdAt";
        searchLatency: "searchLatency";
        searchQuery: "searchQuery";
        totalResults: "totalResults";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    startDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodOptional<z.ZodString>]>;
    endDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodOptional<z.ZodString>]>;
    query: z.ZodOptional<z.ZodString>;
    ipc: z.ZodOptional<z.ZodString>;
    minScore: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maxScore: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    userId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type HistoryQueryFilterDto = z.infer<typeof HistoryQueryFilterDtoSchema>;
/**
 * Zod Schema for History Record ID Parameter
 */
export declare const HistoryParamIdDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
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
//# sourceMappingURL=history.dto.d.ts.map