import type { BM25MatchResult } from '../interfaces/search.interface.js';

export interface BM25DocumentInput {
  id: string;
  patentId: string;
  title: string;
  abstract: string;
  claims?: string | undefined;
  description?: string | undefined;
  ipc?: string | undefined;
  cpc?: string | undefined;
  sourceUrl?: string | undefined;
  metadata?: Record<string, any> | undefined;
}

export interface FieldWeights {
  title: number;
  claims: number;
  abstract: number;
  description: number;
}

/**
 * Enhanced BM25 Search Service with multi-field weighting, phrase preservation,
 * length normalization, and duplicate patent handling.
 * Completely independent from vector store / Pinecone.
 */
export class BM25SearchService {
  private readonly k1: number;
  private readonly b: number;
  private readonly fieldWeights: FieldWeights;

  private static readonly STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'in', 'on', 'at', 'to', 'for', 'from', 'with',
    'by', 'about', 'against', 'between', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'up', 'upon', 'down', 'out', 'off',
    'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
    'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just',
    'should', 'now',
    // Generic patent stop-words
    'system', 'method', 'apparatus', 'device', 'assembly', 'unit',
    'mechanism', 'configured', 'comprising', 'includes', 'including',
    'having', 'wherein', 'plurality', 'said', 'one', 'first', 'second',
    'embodiment', 'embodiments', 'disclosed', 'present', 'invention',
  ]);

  constructor(
    k1 = 1.2,
    b = 0.75,
    fieldWeights: FieldWeights = { title: 3.0, claims: 2.5, abstract: 2.0, description: 1.5 }
  ) {
    this.k1 = k1;
    this.b = b;
    this.fieldWeights = fieldWeights;
  }

  /**
   * Tokenizes text into normalized words and extracts multi-word phrases.
   */
  public tokenize(text: string): { tokens: string[]; phrases: string[]; technicalBoostMap: Map<string, number> } {
    if (!text || !text.trim()) {
      return { tokens: [], phrases: [], technicalBoostMap: new Map() };
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

      // Alphanumeric, hyphenated, or acronym technical terms boost
      const isAlphanumericCode = /[0-9]+[a-zA-Z]+|[a-zA-Z]+[0-9]+/.test(rawWord);
      const isHyphenatedCode = /[a-zA-Z0-9]+-[a-zA-Z0-9]+/.test(rawWord);
      const isUppercaseAcronym = /^[A-Z0-9]{2,8}$/.test(rawWord);

      if (isAlphanumericCode || isHyphenatedCode || isUppercaseAcronym) {
        technicalBoostMap.set(lower, 2.5);
      } else if (!technicalBoostMap.has(lower)) {
        technicalBoostMap.set(lower, 1.0);
      }
    }

    // Extract contiguous multi-word phrases (2-grams, 3-grams) for phrase preservation
    const phrases: string[] = [];
    const cleanTextLower = text.toLowerCase();

    // Extract hyphenated phrases e.g. "microcapsule-based", "fiber-optic"
    const hyphenatedMatches = cleanTextLower.match(/\b[a-z0-9]+-[a-z0-9]+(?:-[a-z0-9]+)?\b/g) || [];
    hyphenatedMatches.forEach((h) => {
      if (!phrases.includes(h)) phrases.push(h);
    });

    // Extract multi-word n-grams
    const simpleWords = cleanTextLower.replace(/[^a-z0-9\s\-]/g, ' ').split(/\s+/).filter(Boolean);
    for (let len = 2; len <= 3; len++) {
      for (let i = 0; i <= simpleWords.length - len; i++) {
        const slice = simpleWords.slice(i, i + len);
        const firstW = slice[0];
        const lastW = slice[slice.length - 1];
        if (firstW && lastW && !BM25SearchService.STOP_WORDS.has(firstW) && !BM25SearchService.STOP_WORDS.has(lastW)) {
          const phraseStr = slice.join(' ');
          if (phraseStr.length >= 6 && !phrases.includes(phraseStr)) {
            phrases.push(phraseStr);
          }
        }
      }
    }

    return { tokens, phrases, technicalBoostMap };
  }

  /**
   * Ranks candidate patent documents using field-weighted BM25 + phrase preservation + deduplication.
   */
  public rankDocuments(query: string, documents: BM25DocumentInput[], topK = 50): BM25MatchResult[] {
    if (!query || !query.trim() || !documents || documents.length === 0) {
      return [];
    }

    const { tokens: queryTokens, phrases: queryPhrases, technicalBoostMap } = this.tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }

    // 1. Group documents by patentId to prepare for deduplication and field aggregation
    const patentGroupMap = new Map<string, BM25DocumentInput[]>();
    for (const doc of documents) {
      const pid = doc.patentId || doc.id || 'UNKNOWN';
      if (!patentGroupMap.has(pid)) {
        patentGroupMap.set(pid, []);
      }
      patentGroupMap.get(pid)!.push(doc);
    }

    // Consolidated patent entities
    const consolidatedDocs = Array.from(patentGroupMap.entries())
      .map(([patentId, group]) => {
        const primary = group[0];
        if (!primary) return null;

        const mergedTitle = Array.from(new Set(group.map((g) => g.title).filter(Boolean))).join(' ');
        const mergedAbstract = Array.from(new Set(group.map((g) => g.abstract).filter(Boolean))).join(' ');
        const mergedClaims = Array.from(new Set(group.map((g) => g.claims).filter(Boolean))).join(' ');
        const mergedDescription = Array.from(new Set(group.map((g) => g.description).filter(Boolean))).join(' ');

        return {
          id: primary.id,
          patentId,
          title: mergedTitle || primary.title || '',
          abstract: mergedAbstract || primary.abstract || '',
          claims: mergedClaims || primary.claims || undefined,
          description: mergedDescription || primary.description || undefined,
          ipc: primary.ipc || '',
          cpc: primary.cpc || undefined,
          sourceUrl: primary.sourceUrl || undefined,
        };
      })
      .filter((d): d is NonNullable<typeof d> => d !== null);

    const totalDocs = consolidatedDocs.length;

    // 2. Prepare field tokenizations & lengths for field weighting
    const docFields = consolidatedDocs.map((doc) => {
      const titleToks = this.tokenize(doc.title).tokens;
      const abstractToks = this.tokenize(doc.abstract).tokens;
      const claimsToks = this.tokenize(doc.claims || '').tokens;
      const descriptionToks = this.tokenize(doc.description || '').tokens;

      return {
        doc,
        fields: {
          title: { text: doc.title.toLowerCase(), tokens: titleToks, length: titleToks.length },
          claims: { text: (doc.claims || '').toLowerCase(), tokens: claimsToks, length: claimsToks.length },
          abstract: { text: doc.abstract.toLowerCase(), tokens: abstractToks, length: abstractToks.length },
          description: { text: (doc.description || '').toLowerCase(), tokens: descriptionToks, length: descriptionToks.length },
        },
      };
    });

    // Calculate average field lengths across corpus
    const avgLengths = {
      title: docFields.reduce((sum, d) => sum + d.fields.title.length, 0) / (totalDocs || 1),
      claims: docFields.reduce((sum, d) => sum + d.fields.claims.length, 0) / (totalDocs || 1),
      abstract: docFields.reduce((sum, d) => sum + d.fields.abstract.length, 0) / (totalDocs || 1),
      description: docFields.reduce((sum, d) => sum + d.fields.description.length, 0) / (totalDocs || 1),
    };

    // 3. Compute Document Frequency (DF) for each query token across combined corpus
    const docFreqMap = new Map<string, number>();
    for (const qToken of queryTokens) {
      let count = 0;
      for (const d of docFields) {
        const hasToken =
          d.fields.title.tokens.includes(qToken) ||
          d.fields.claims.tokens.includes(qToken) ||
          d.fields.abstract.tokens.includes(qToken) ||
          d.fields.description.tokens.includes(qToken);
        if (hasToken) count++;
      }
      docFreqMap.set(qToken, count);
    }

    // 4. Compute Field-Weighted BM25 Score + Phrase Bonus for each patent
    const fieldKeys: Array<keyof FieldWeights> = ['title', 'claims', 'abstract', 'description'];

    const scoredDocs: BM25MatchResult[] = docFields.map(({ doc, fields }) => {
      let totalBm25Score = 0;

      // Single Token BM25 across weighted fields
      for (const fieldKey of fieldKeys) {
        const fieldData = fields[fieldKey];
        const fieldWeight = this.fieldWeights[fieldKey];
        const avgLen = avgLengths[fieldKey] || 1;

        if (fieldData.length === 0 || fieldWeight === 0) continue;

        // Build term frequency map for this field
        const tfMap = new Map<string, number>();
        for (const t of fieldData.tokens) {
          tfMap.set(t, (tfMap.get(t) || 0) + 1);
        }

        for (const qToken of queryTokens) {
          const tf = tfMap.get(qToken) || 0;
          if (tf === 0) continue;

          const df = docFreqMap.get(qToken) || 0;
          const idf = Math.log((totalDocs - df + 0.5) / (df + 0.5) + 1);
          const techMultiplier = technicalBoostMap.get(qToken) || 1.0;

          // Okapi BM25 TF component with length normalization
          const tfComponent = (tf * (this.k1 + 1)) / (tf + this.k1 * (1 - this.b + this.b * (fieldData.length / avgLen)));
          totalBm25Score += fieldWeight * idf * tfComponent * techMultiplier;
        }
      }

      // Exact Phrase Preservation Bonus
      for (const phrase of queryPhrases) {
        for (const fieldKey of fieldKeys) {
          const fieldText = fields[fieldKey].text;
          const fieldWeight = this.fieldWeights[fieldKey];

          if (fieldText && fieldText.includes(phrase)) {
            // Award phrase match bonus scaled by field weight and phrase length
            const phraseLengthBonus = phrase.split(' ').length * 1.5;
            totalBm25Score += fieldWeight * phraseLengthBonus;
          }
        }
      }

      return {
        id: doc.id,
        patentId: doc.patentId,
        title: doc.title,
        abstract: doc.abstract,
        claims: doc.claims,
        description: doc.description,
        ipc: doc.ipc,
        cpc: doc.cpc,
        sourceUrl: doc.sourceUrl,
        bm25Score: Math.max(0, Number(totalBm25Score.toFixed(4))),
      };
    });

    // 5. Sort descending by BM25 score
    scoredDocs.sort((a, b) => b.bm25Score - a.bm25Score);

    // 6. Assign 1-indexed rank
    const rankedResults = scoredDocs.slice(0, topK).map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    return rankedResults;
  }
}
