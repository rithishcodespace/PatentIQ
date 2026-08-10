import type { BM25MatchResult } from '../interfaces/search.interface.js';

export interface BM25DocumentInput {
  id: string;
  patentId: string;
  title: string;
  abstract: string;
  claims?: string | undefined;
  ipc?: string | undefined;
  metadata?: Record<string, any> | undefined;
}

export class BM25SearchService {
  private readonly k1: number;
  private readonly b: number;

  private static readonly STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'in', 'on', 'at', 'to', 'for', 'from', 'with',
    'by', 'about', 'against', 'between', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'to', 'from', 'up', 'upon',
    'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    's', 't', 'can', 'will', 'just', 'don', 'should', 'now',
    // Patent specific stop words
    'system', 'method', 'apparatus', 'device', 'assembly', 'unit',
    'mechanism', 'configured', 'comprising', 'includes', 'including',
    'having', 'wherein', 'plurality', 'said', 'one', 'first', 'second',
  ]);

  constructor(k1 = 1.2, b = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  /**
   * Tokenizes text into normalized words, identifying technical part numbers & nomenclature.
   */
  public tokenize(text: string): { tokens: string[]; technicalBoostMap: Map<string, number> } {
    if (!text || !text.trim()) {
      return { tokens: [], technicalBoostMap: new Map() };
    }

    const rawWords = text
      .replace(/[\n\r\t]/g, ' ')
      .replace(/[^a-zA-Z0-9\-\/]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);

    const tokens: string[] = [];
    const technicalBoostMap = new Map<string, number>();

    for (const rawWord of rawWords) {
      const lower = rawWord.toLowerCase();
      if (BM25SearchService.STOP_WORDS.has(lower)) {
        continue;
      }

      tokens.push(lower);

      // Technical term / part number / alphanumeric code detection heuristic
      // e.g. "UV-C", "265nm", "RS-485", "LiDAR", "US-10112233", numbers with units
      const isAlphanumericCode = /[0-9]+[a-zA-Z]+|[a-zA-Z]+[0-9]+/.test(rawWord);
      const isHyphenatedCode = /[a-zA-Z0-9]+-[a-zA-Z0-9]+/.test(rawWord);
      const isUppercaseAcronym = /^[A-Z0-9]{2,8}$/.test(rawWord);

      if (isAlphanumericCode || isHyphenatedCode || isUppercaseAcronym) {
        technicalBoostMap.set(lower, 2.5); // 2.5x boost for technical part numbers / codes
      } else if (!technicalBoostMap.has(lower)) {
        technicalBoostMap.set(lower, 1.0);
      }
    }

    return { tokens, technicalBoostMap };
  }

  /**
   * Performs BM25 scoring over a collection of candidate document inputs against query.
   */
  public rankDocuments(query: string, documents: BM25DocumentInput[], topK = 50): BM25MatchResult[] {
    if (!query || !query.trim() || documents.length === 0) {
      return [];
    }

    const { tokens: queryTokens, technicalBoostMap } = this.tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }

    // 1. Build document corpus tokenizations
    const docTokenizations = documents.map((doc) => {
      const combinedText = `${doc.title} ${doc.title} ${doc.abstract} ${doc.claims || ''} ${doc.ipc || ''}`;
      const { tokens } = this.tokenize(combinedText);
      return { doc, tokens, length: tokens.length };
    });

    const totalDocs = docTokenizations.length;
    const totalLength = docTokenizations.reduce((sum, d) => sum + d.length, 0);
    const avgDocLength = totalLength / (totalDocs || 1);

    // 2. Compute document frequency (df) for each query token
    const docFreqMap = new Map<string, number>();
    for (const qToken of queryTokens) {
      let count = 0;
      for (const d of docTokenizations) {
        if (d.tokens.includes(qToken)) {
          count++;
        }
      }
      docFreqMap.set(qToken, count);
    }

    // 3. Compute BM25 score for each document
    const scoredDocs: BM25MatchResult[] = docTokenizations.map(({ doc, tokens, length }) => {
      // Calculate term frequency map for this document
      const tfMap = new Map<string, number>();
      for (const t of tokens) {
        tfMap.set(t, (tfMap.get(t) || 0) + 1);
      }

      let bm25Score = 0;

      for (const qToken of queryTokens) {
        const tf = tfMap.get(qToken) || 0;
        if (tf === 0) continue;

        const df = docFreqMap.get(qToken) || 0;
        const idf = Math.log((totalDocs - df + 0.5) / (df + 0.5) + 1);
        const weightMultiplier = technicalBoostMap.get(qToken) || 1.0;

        const tfComponent = (tf * (this.k1 + 1)) / (tf + this.k1 * (1 - this.b + this.b * (length / (avgDocLength || 1))));
        bm25Score += idf * tfComponent * weightMultiplier;
      }

      return {
        id: doc.id,
        patentId: doc.patentId,
        title: doc.title,
        abstract: doc.abstract,
        claims: doc.claims,
        ipc: doc.ipc || '',
        bm25Score: Math.max(0, Number(bm25Score.toFixed(4))),
      };
    });

    // 4. Sort descending by BM25 score
    scoredDocs.sort((a, b) => b.bm25Score - a.bm25Score);

    return scoredDocs.slice(0, topK);
  }
}
