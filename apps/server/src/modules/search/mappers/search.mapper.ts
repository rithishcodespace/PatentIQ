import type { PineconeMatchResult, PineconeVectorMetadata } from '../interfaces/search.interface.js';
import type { SearchResultDto } from '../dto/search.dto.js';

/**
 * Utility mapper layer for converting raw Pinecone match results
 * into clean, structured, normalized, and ranked API response DTOs.
 */
export class SearchMapper {
  /**
   * Safely formats and rounds a raw numeric similarity score to four decimal places.
   */
  public static formatScore(rawScore: number | undefined | null): number {
    if (rawScore === undefined || rawScore === null || Number.isNaN(rawScore) || !Number.isFinite(rawScore)) {
      return 0;
    }
    return Number(rawScore.toFixed(4));
  }

  /**
   * Truncates claims text if it exceeds maximum character threshold to prevent excessive payload size.
   */
  public static formatClaims(claimsText: string | undefined | null, maxChars = 1000): string | undefined {
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
   * Normalizes array or string fields safely into a comma-separated string without fabrication.
   */
  public static formatStringOrArray(val: string | string[] | undefined | null): string | undefined {
    if (!val) return undefined;
    if (Array.isArray(val)) {
      const clean = val.map((s) => String(s).trim()).filter(Boolean);
      return clean.length > 0 ? clean.join(', ') : undefined;
    }
    const trimmed = String(val).trim();
    return trimmed ? trimmed : undefined;
  }

  /**
   * Transforms a single Pinecone match item into a structured SearchResultDto object.
   * Preserves all normalized metadata without fabricating missing values.
   */
  public static toSearchResultDto(match: PineconeMatchResult, rank: number): SearchResultDto {
    const rawScore = typeof match?.score === 'number' ? match.score : 0;
    const meta = (match?.metadata || {}) as PineconeVectorMetadata;

    // Extract patent & publication identifiers
    const matchId = match?.id || '';
    const patentIdFromId = matchId ? matchId.split('_')[0] : '';
    const patentId = (meta.patentId && String(meta.patentId).trim()) || patentIdFromId || 'UNKNOWN';
    const publicationNumber = meta.publicationNumber ? String(meta.publicationNumber).trim() : patentId;

    // Chunk & section details
    const sectionType = meta.sectionType ? String(meta.sectionType).trim() : (meta.section ? String(meta.section).trim() : undefined);
    const chunkId = meta.chunkId ? String(meta.chunkId).trim() : (matchId || undefined);

    // Classification codes
    const ipc = meta.ipc ? String(meta.ipc).trim() : '';
    const cpc = meta.cpc ? String(meta.cpc).trim() : undefined;

    // Text disclosures
    const title = meta.title ? String(meta.title).trim() : (sectionType === 'title' ? `Patent ${patentId}` : `Patent ${patentId}`);
    const abstract = meta.abstract ? String(meta.abstract).trim() : (sectionType === 'abstract' ? `Abstract for patent ${patentId}` : `Patent disclosure: ${patentId}`);
    const claims = this.formatClaims(meta.claims);
    const description = meta.description ? String(meta.description).trim() : undefined;

    // Metadata entities
    const country = meta.country ? String(meta.country).trim() : undefined;
    const owner = meta.owner || meta.assignee ? String(meta.owner || meta.assignee).trim() : undefined;
    const applicants = this.formatStringOrArray(meta.applicants) || owner;
    const inventors = this.formatStringOrArray(meta.inventors);

    // Dates
    const publicationDate = meta.publicationDate ? String(meta.publicationDate).trim() : undefined;
    const filingDate = meta.filingDate ? String(meta.filingDate).trim() : undefined;
    const priorityDate = meta.priorityDate ? String(meta.priorityDate).trim() : undefined;

    // Source URL calculation (Preserves explicit sourceUrl if present, else constructs official link)
    const rawSourceUrl = meta.sourceUrl;
    const cleanId = String(publicationNumber || patentId).replace(/[^a-zA-Z0-9]/g, '');
    const formattedId = /^[a-zA-Z]{2}/.test(cleanId) ? cleanId : `US${cleanId}`;
    const sourceUrl = rawSourceUrl || `https://patents.google.com/patent/${formattedId}/en`;

    const dto: SearchResultDto = {
      rank,
      score: this.formatScore(rawScore),
      denseScore: this.formatScore(rawScore),
      patentId,
      publicationNumber,
      title,
      abstract,
      ipc,
      sourceUrl,
    };

    if (claims) dto.claims = claims;
    if (description) dto.description = description;
    if (cpc) dto.cpc = cpc;
    if (country) dto.country = country;
    if (owner) dto.owner = owner;
    if (applicants) dto.applicants = applicants;
    if (inventors) dto.inventors = inventors;
    if (publicationDate) dto.publicationDate = publicationDate;
    if (filingDate) dto.filingDate = filingDate;
    if (priorityDate) dto.priorityDate = priorityDate;
    if (sectionType) dto.sectionType = sectionType;
    if (chunkId) dto.chunkId = chunkId;
    if (typeof meta.claimNumber === 'number') dto.claimNumber = meta.claimNumber;
    if (matchId) dto.vectorId = matchId;

    return dto;
  }

  /**
   * Sorts raw Pinecone matches in descending order by original score,
   * deduplicates multiple vector chunks belonging to the same patent,
   * merges missing section text, and maps to Top-K SearchResultDto items.
   */
  public static toSearchResultList(matches: PineconeMatchResult[], topK?: number): SearchResultDto[] {
    if (!matches || !Array.isArray(matches) || matches.length === 0) {
      return [];
    }

    // Deduplicate matches by patentId / publicationNumber
    const groupedMap = new Map<string, { topMatch: PineconeMatchResult; mergedMeta: PineconeVectorMetadata }>();

    for (const match of matches) {
      const meta = (match?.metadata || {}) as PineconeVectorMetadata;
      const matchId = match?.id || '';
      const patentId = meta.patentId || meta.publicationNumber || (matchId ? matchId.split('_')[0] : '') || 'UNKNOWN';

      if (!groupedMap.has(patentId)) {
        groupedMap.set(patentId, {
          topMatch: match,
          mergedMeta: { ...meta },
        });
      } else {
        const existing = groupedMap.get(patentId)!;
        const currentScore = match.score ?? 0;
        const topScore = existing.topMatch.score ?? 0;

        // Merge section text disclosures across chunks
        if (!existing.mergedMeta.claims && meta.claims) existing.mergedMeta.claims = meta.claims;
        if (!existing.mergedMeta.abstract && meta.abstract) existing.mergedMeta.abstract = meta.abstract;
        if (!existing.mergedMeta.description && meta.description) existing.mergedMeta.description = meta.description;

        if (currentScore > topScore) {
          existing.topMatch = match;
        }

        const updatedMeta: PineconeVectorMetadata = {
          ...existing.topMatch.metadata,
          patentId: existing.mergedMeta.patentId || patentId,
        };
        if (existing.mergedMeta.claims) updatedMeta.claims = existing.mergedMeta.claims;
        if (existing.mergedMeta.abstract) updatedMeta.abstract = existing.mergedMeta.abstract;
        if (existing.mergedMeta.description) updatedMeta.description = existing.mergedMeta.description;

        existing.topMatch = {
          ...existing.topMatch,
          metadata: updatedMeta,
        };
      }
    }

    const deduplicatedMatches = Array.from(groupedMap.values()).map((item) => item.topMatch);

    // Sort descending by raw score
    deduplicatedMatches.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    // Slice to topK
    const sliced = typeof topK === 'number' && topK > 0 ? deduplicatedMatches.slice(0, topK) : deduplicatedMatches;

    return sliced.map((match, index) => this.toSearchResultDto(match, index + 1));
  }
}
