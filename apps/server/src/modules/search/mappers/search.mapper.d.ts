import type { PineconeMatchResult } from '../interfaces/search.interface.js';
import type { SearchResultDto } from '../dto/search.dto.js';
/**
 * Utility mapper layer for converting raw Pinecone match results
 * into clean, structured, and ranked API response DTOs.
 */
export declare class SearchMapper {
    /**
     * Safely formats and rounds a raw numeric similarity score to four decimal places.
     * Keeps the score as a numeric type.
     */
    static formatScore(rawScore: number | undefined | null): number;
    /**
     * Truncates claims text if it exceeds maximum character threshold to prevent excessive payload size.
     */
    static formatClaims(claimsText: string | undefined | null, maxChars?: number): string | undefined;
    /**
     * Transforms a single Pinecone match item into a structured SearchResultDto object.
     *
     * @param match Raw match item returned by Pinecone query
     * @param rank 1-indexed ranking position in sorted search results
     */
    static toSearchResultDto(match: PineconeMatchResult, rank: number): SearchResultDto;
    /**
     * Sorts raw Pinecone matches in descending order by original raw similarity score,
     * preserves original index order when scores match, and maps to Top-K SearchResultDto items.
     *
     * @param matches List of raw Pinecone match objects
     * @param topK Maximum number of results to return
     */
    static toSearchResultList(matches: PineconeMatchResult[], topK?: number): SearchResultDto[];
}
//# sourceMappingURL=search.mapper.d.ts.map