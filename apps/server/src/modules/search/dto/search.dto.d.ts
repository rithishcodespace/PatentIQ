import { z } from 'zod';
import type { SearchRequest, SearchResponse, SearchResult, SearchFilter } from '../interfaces/search.interface.js';
/**
 * Zod validation schema for metadata-based search filters.
 */
export declare const SearchFilterDtoSchema: z.ZodObject<{
    ipc: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    publicationDate: z.ZodOptional<z.ZodString>;
    publicationDateFrom: z.ZodOptional<z.ZodString>;
    publicationDateTo: z.ZodOptional<z.ZodString>;
    owner: z.ZodOptional<z.ZodString>;
    section: z.ZodOptional<z.ZodEnum<{
        abstract: "abstract";
        claims: "claims";
        title: "title";
    }>>;
}, z.core.$strip>;
export type SearchFilterDto = z.infer<typeof SearchFilterDtoSchema>;
/**
 * Zod validation schema for POST /api/search request payload.
 */
export declare const SearchRequestDtoSchema: z.ZodObject<{
    query: z.ZodString;
    topK: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    filters: z.ZodOptional<z.ZodObject<{
        ipc: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        publicationDate: z.ZodOptional<z.ZodString>;
        publicationDateFrom: z.ZodOptional<z.ZodString>;
        publicationDateTo: z.ZodOptional<z.ZodString>;
        owner: z.ZodOptional<z.ZodString>;
        section: z.ZodOptional<z.ZodEnum<{
            abstract: "abstract";
            claims: "claims";
            title: "title";
        }>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type SearchRequestDto = z.infer<typeof SearchRequestDtoSchema>;
/**
 * Zod validation schema for individual search result items.
 */
export declare const SearchResultDtoSchema: z.ZodObject<{
    rank: z.ZodNumber;
    score: z.ZodNumber;
    patentId: z.ZodString;
    title: z.ZodString;
    abstract: z.ZodString;
    claims: z.ZodOptional<z.ZodString>;
    ipc: z.ZodString;
    country: z.ZodOptional<z.ZodString>;
    owner: z.ZodOptional<z.ZodString>;
    publicationDate: z.ZodOptional<z.ZodString>;
    section: z.ZodOptional<z.ZodString>;
    vectorId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SearchResultDto = z.infer<typeof SearchResultDtoSchema>;
/**
 * Zod validation schema for top-level search response payload.
 */
export declare const SearchResponseDtoSchema: z.ZodObject<{
    success: z.ZodBoolean;
    query: z.ZodString;
    count: z.ZodNumber;
    filters: z.ZodOptional<z.ZodObject<{
        ipc: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        publicationDate: z.ZodOptional<z.ZodString>;
        publicationDateFrom: z.ZodOptional<z.ZodString>;
        publicationDateTo: z.ZodOptional<z.ZodString>;
        owner: z.ZodOptional<z.ZodString>;
        section: z.ZodOptional<z.ZodEnum<{
            abstract: "abstract";
            claims: "claims";
            title: "title";
        }>>;
    }, z.core.$strip>>;
    confidence: z.ZodOptional<z.ZodObject<{
        retrieval: z.ZodObject<{
            score: z.ZodNumber;
            level: z.ZodString;
        }, z.core.$strip>;
        analysis: z.ZodOptional<z.ZodObject<{
            score: z.ZodNumber;
            level: z.ZodString;
        }, z.core.$strip>>;
        overall: z.ZodOptional<z.ZodObject<{
            score: z.ZodNumber;
            level: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    results: z.ZodArray<z.ZodObject<{
        rank: z.ZodNumber;
        score: z.ZodNumber;
        patentId: z.ZodString;
        title: z.ZodString;
        abstract: z.ZodString;
        claims: z.ZodOptional<z.ZodString>;
        ipc: z.ZodString;
        country: z.ZodOptional<z.ZodString>;
        owner: z.ZodOptional<z.ZodString>;
        publicationDate: z.ZodOptional<z.ZodString>;
        section: z.ZodOptional<z.ZodString>;
        vectorId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
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
export declare const SearchQueryDtoSchema: z.ZodObject<{
    query: z.ZodString;
    topK: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    filters: z.ZodOptional<z.ZodObject<{
        ipc: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        publicationDate: z.ZodOptional<z.ZodString>;
        publicationDateFrom: z.ZodOptional<z.ZodString>;
        publicationDateTo: z.ZodOptional<z.ZodString>;
        owner: z.ZodOptional<z.ZodString>;
        section: z.ZodOptional<z.ZodEnum<{
            abstract: "abstract";
            claims: "claims";
            title: "title";
        }>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type SearchQueryDto = SearchRequestDto;
//# sourceMappingURL=search.dto.d.ts.map