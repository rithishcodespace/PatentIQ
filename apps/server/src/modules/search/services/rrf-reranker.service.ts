import type { SearchResult, BM25MatchResult } from '../interfaces/search.interface.js';

export interface RRFOptions {
  k?: number | undefined;
  vectorWeight?: number | undefined;
  bm25Weight?: number | undefined;
  topK?: number | undefined;
}

export interface RRFRerankInput {
  denseResults: SearchResult[] | Array<{ patentId: string; rank?: number; score?: number; denseScore?: number; [key: string]: any }>;
  bm25Results: BM25MatchResult[] | Array<{ patentId: string; rank?: number; bm25Score?: number; [key: string]: any }>;
  topK?: number | undefined;
  k?: number | undefined;
  vectorWeight?: number | undefined;
  bm25Weight?: number | undefined;
}

export interface RRFRerankResultItem extends SearchResult {
  patentId: string;
  rrfScore: number;
  denseRank: number | null;
  bm25Rank: number | null;
  finalRank: number;
}

/**
 * Dedicated Reciprocal Rank Fusion (RRF) Reranker Service.
 * Combines ranking positions from dense vector search and BM25 lexical search
 * without treating raw cosine similarity and BM25 scores as directly comparable.
 * Independent of domain/patent-specific logic.
 */
export class RRFRerankerService {
  private readonly defaultK: number;
  private readonly defaultVectorWeight: number;
  private readonly defaultBm25Weight: number;

  constructor(k = 60, vectorWeight = 0.6, bm25Weight = 0.4) {
    this.defaultK = k;
    this.defaultVectorWeight = vectorWeight;
    this.defaultBm25Weight = bm25Weight;
  }

  /**
   * Main fusion method supporting both object input and standard 3-parameter overload.
   */
  public rerank(input: RRFRerankInput): SearchResult[] {
    return this.fuseRanks(input.denseResults as SearchResult[], input.bm25Results as BM25MatchResult[], {
      topK: input.topK,
      k: input.k,
      vectorWeight: input.vectorWeight,
      bm25Weight: input.bm25Weight,
    });
  }

  /**
   * Reciprocal Rank Fusion algorithm merging dense vector search results and sparse BM25 lexical results.
   */
  public fuseRanks(
    denseResults: SearchResult[] | undefined | null,
    sparseResults: BM25MatchResult[] | undefined | null,
    options?: RRFOptions
  ): SearchResult[] {
    const denseList = denseResults || [];
    const sparseList = sparseResults || [];

    const k = options?.k ?? this.defaultK;
    const wVector = options?.vectorWeight ?? this.defaultVectorWeight;
    const wBm25 = options?.bm25Weight ?? this.defaultBm25Weight;
    const topK = options?.topK ?? 10;

    const rrfMap = new Map<
      string,
      {
        patentId: string;
        title: string;
        abstract: string;
        claims?: string | undefined;
        description?: string | undefined;
        ipc: string;
        cpc?: string | undefined;
        country?: string | undefined;
        owner?: string | undefined;
        applicants?: string | undefined;
        inventors?: string | undefined;
        publicationDate?: string | undefined;
        sourceUrl?: string | undefined;
        denseRank: number | null;
        bm25Rank: number | null;
        denseScore: number;
        bm25Score: number;
        rrfScore: number;
      }
    >();

    // 1. Process Dense Vector Ranks (deduplicating by patentId)
    denseList.forEach((item, idx) => {
      if (!item || !item.patentId) return;
      const pid = String(item.patentId).trim();
      if (!pid) return;

      const rankInDense = (typeof item.rank === 'number' && item.rank > 0) ? item.rank : idx + 1;

      if (!rrfMap.has(pid)) {
        rrfMap.set(pid, {
          patentId: pid,
          title: item.title || `Patent ${pid}`,
          abstract: item.abstract || '',
          claims: item.claims,
          description: item.description,
          ipc: item.ipc || '',
          cpc: item.cpc,
          country: item.country,
          owner: item.owner,
          applicants: item.applicants,
          inventors: item.inventors,
          publicationDate: item.publicationDate,
          sourceUrl: item.sourceUrl,
          denseRank: rankInDense,
          bm25Rank: null,
          denseScore: item.denseScore ?? item.score ?? 0,
          bm25Score: 0,
          rrfScore: wVector / (k + rankInDense),
        });
      } else {
        // Keep the best (lowest 1-based) dense rank if duplicate entries exist
        const existing = rrfMap.get(pid)!;
        if (existing.denseRank === null || rankInDense < existing.denseRank) {
          existing.denseRank = rankInDense;
          existing.rrfScore = (wVector / (k + rankInDense)) + (existing.bm25Rank !== null ? wBm25 / (k + existing.bm25Rank) : 0);
        }
      }
    });

    // 2. Process Sparse BM25 Ranks (deduplicating by patentId)
    sparseList.forEach((item, idx) => {
      if (!item || !item.patentId) return;
      const pid = String(item.patentId).trim();
      if (!pid) return;

      const rankInBm25 = (typeof item.rank === 'number' && item.rank > 0) ? item.rank : idx + 1;

      const existing = rrfMap.get(pid);
      if (existing) {
        if (existing.bm25Rank === null || rankInBm25 < existing.bm25Rank) {
          existing.bm25Rank = rankInBm25;
          existing.bm25Score = item.bm25Score ?? existing.bm25Score;
          existing.rrfScore = (existing.denseRank !== null ? wVector / (k + existing.denseRank) : 0) + (wBm25 / (k + rankInBm25));
        }
      } else {
        rrfMap.set(pid, {
          patentId: pid,
          title: item.title || `Patent ${pid}`,
          abstract: item.abstract || '',
          claims: item.claims,
          description: item.description,
          ipc: item.ipc || '',
          cpc: item.cpc,
          sourceUrl: item.sourceUrl,
          denseRank: null,
          bm25Rank: rankInBm25,
          denseScore: 0,
          bm25Score: item.bm25Score ?? 0,
          rrfScore: wBm25 / (k + rankInBm25),
        });
      }
    });

    // 3. Convert map to array and sort deterministically
    const fusedList = Array.from(rrfMap.values());

    fusedList.sort((a, b) => {
      // Primary: RRF score descending
      const scoreDiff = b.rrfScore - a.rrfScore;
      if (Math.abs(scoreDiff) > 1e-9) {
        return scoreDiff;
      }

      // Tie-break 1: Present in both lists > Present in single list
      const aInBoth = a.denseRank !== null && a.bm25Rank !== null ? 1 : 0;
      const bInBoth = b.denseRank !== null && b.bm25Rank !== null ? 1 : 0;
      if (aInBoth !== bInBoth) {
        return bInBoth - aInBoth;
      }

      // Tie-break 2: Dense rank ascending (lower rank is better)
      if (a.denseRank !== null && b.denseRank !== null && a.denseRank !== b.denseRank) {
        return a.denseRank - b.denseRank;
      }

      // Tie-break 3: BM25 rank ascending
      if (a.bm25Rank !== null && b.bm25Rank !== null && a.bm25Rank !== b.bm25Rank) {
        return a.bm25Rank - b.bm25Rank;
      }

      // Tie-break 4: Lexicographical order of patentId for 100% deterministic ordering
      return a.patentId.localeCompare(b.patentId);
    });

    // 4. Format into SearchResult DTOs with finalRank and rrfScore
    return fusedList.slice(0, topK).map((item, idx) => {
      const finalRank = idx + 1;
      const roundedRrfScore = Number(item.rrfScore.toFixed(4));

      const res: SearchResult = {
        rank: finalRank,
        finalRank,
        score: roundedRrfScore,
        rrfScore: roundedRrfScore,
        denseScore: Number(item.denseScore.toFixed(4)),
        bm25Score: Number(item.bm25Score.toFixed(4)),
        denseRank: item.denseRank,
        bm25Rank: item.bm25Rank,
        patentId: item.patentId,
        title: item.title,
        abstract: item.abstract,
        ipc: item.ipc,
      };

      if (item.claims) res.claims = item.claims;
      if (item.description) res.description = item.description;
      if (item.cpc) res.cpc = item.cpc;
      if (item.country) res.country = item.country;
      if (item.owner) res.owner = item.owner;
      if (item.applicants) res.applicants = item.applicants;
      if (item.inventors) res.inventors = item.inventors;
      if (item.publicationDate) res.publicationDate = item.publicationDate;
      if (item.sourceUrl) res.sourceUrl = item.sourceUrl;

      return res;
    });
  }
}
