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
export declare class BM25SearchService {
    private readonly k1;
    private readonly b;
    private static readonly STOP_WORDS;
    constructor(k1?: number, b?: number);
    /**
     * Tokenizes text into normalized words, identifying technical part numbers & nomenclature.
     */
    tokenize(text: string): {
        tokens: string[];
        technicalBoostMap: Map<string, number>;
    };
    /**
     * Performs BM25 scoring over a collection of candidate document inputs against query.
     */
    rankDocuments(query: string, documents: BM25DocumentInput[], topK?: number): BM25MatchResult[];
}
//# sourceMappingURL=bm25-search.service.d.ts.map