/**
 * Utility mapper layer for converting raw Pinecone match results
 * into clean, structured, and ranked API response DTOs.
 */
export class SearchMapper {
    /**
     * Safely formats and rounds a raw numeric similarity score to four decimal places.
     * Keeps the score as a numeric type.
     */
    static formatScore(rawScore) {
        if (rawScore === undefined || rawScore === null || Number.isNaN(rawScore) || !Number.isFinite(rawScore)) {
            return 0;
        }
        return Number(rawScore.toFixed(4));
    }
    /**
     * Truncates claims text if it exceeds maximum character threshold to prevent excessive payload size.
     */
    static formatClaims(claimsText, maxChars = 1000) {
        if (!claimsText || typeof claimsText !== 'string') {
            return undefined;
        }
        const trimmed = claimsText.trim();
        if (!trimmed) {
            return undefined;
        }
        if (trimmed.length <= maxChars) {
            return trimmed;
        }
        return `${trimmed.substring(0, maxChars)}... [truncated]`;
    }
    /**
     * Transforms a single Pinecone match item into a structured SearchResultDto object.
     *
     * @param match Raw match item returned by Pinecone query
     * @param rank 1-indexed ranking position in sorted search results
     */
    static toSearchResultDto(match, rank) {
        const rawScore = typeof match?.score === 'number' ? match.score : 0;
        const meta = (match?.metadata || {});
        // Extract patent identifier
        const matchId = match?.id || '';
        const patentIdFromId = matchId ? matchId.split('_')[0] : '';
        const patentId = (meta.patentId && String(meta.patentId).trim()) || patentIdFromId || 'UNKNOWN';
        // Extract section information
        const section = meta.section ? String(meta.section).trim() : undefined;
        // Extract IPC classification
        const ipc = meta.ipc ? String(meta.ipc).trim() : '';
        // Extract title with intelligent fallback
        const rawTitle = meta.title ? String(meta.title).trim() : '';
        const title = rawTitle || (section === 'title' ? `Patent ${patentId}` : `Patent ${patentId}`);
        // Extract abstract with intelligent fallback
        const rawAbstract = meta.abstract ? String(meta.abstract).trim() : '';
        const abstract = rawAbstract || (section === 'abstract' ? `Abstract for patent ${patentId}` : `Patent section: ${section || 'general'}`);
        // Extract claims (optional/truncated if large)
        const claims = this.formatClaims(meta.claims);
        // Extract country code
        const country = meta.country ? String(meta.country).trim() : undefined;
        // Extract owner / assignee
        const rawOwner = meta.owner || meta.assignee;
        const owner = rawOwner ? String(rawOwner).trim() : undefined;
        // Extract publication date
        const rawPubDate = meta.publicationDate || meta?.pubdate || meta?.date;
        const publicationDate = rawPubDate ? String(rawPubDate).trim() : undefined;
        // Build final result DTO
        const dto = {
            rank,
            score: this.formatScore(rawScore),
            patentId,
            title,
            abstract,
            ipc,
        };
        if (claims) {
            dto.claims = claims;
        }
        if (country) {
            dto.country = country;
        }
        if (owner) {
            dto.owner = owner;
        }
        if (publicationDate) {
            dto.publicationDate = publicationDate;
        }
        if (section) {
            dto.section = section;
        }
        if (matchId) {
            dto.vectorId = matchId;
        }
        return dto;
    }
    /**
     * Sorts raw Pinecone matches in descending order by original raw similarity score,
     * preserves original index order when scores match, and maps to Top-K SearchResultDto items.
     *
     * @param matches List of raw Pinecone match objects
     * @param topK Maximum number of results to return
     */
    static toSearchResultList(matches, topK) {
        if (!matches || !Array.isArray(matches) || matches.length === 0) {
            return [];
        }
        // 1. Sort using the original raw score (descending order)
        const sorted = [...matches].sort((a, b) => {
            const scoreA = typeof a?.score === 'number' ? a.score : 0;
            const scoreB = typeof b?.score === 'number' ? b.score : 0;
            return scoreB - scoreA;
        });
        // 2. Slice to topK if specified
        const sliced = typeof topK === 'number' && topK > 0 ? sorted.slice(0, topK) : sorted;
        // 3. Map to SearchResultDto with 1-based ranking position
        return sliced.map((match, index) => this.toSearchResultDto(match, index + 1));
    }
}
//# sourceMappingURL=search.mapper.js.map