export class RRFRerankerService {
    defaultK;
    defaultVectorWeight;
    defaultBm25Weight;
    constructor(k = 60, vectorWeight = 0.6, bm25Weight = 0.4) {
        this.defaultK = k;
        this.defaultVectorWeight = vectorWeight;
        this.defaultBm25Weight = bm25Weight;
    }
    /**
     * Reciprocal Rank Fusion algorithm merging dense vector search results and sparse BM25 lexical results.
     */
    fuseRanks(denseResults, sparseResults, options) {
        const k = options?.k ?? this.defaultK;
        const wVector = options?.vectorWeight ?? this.defaultVectorWeight;
        const wBm25 = options?.bm25Weight ?? this.defaultBm25Weight;
        const topK = options?.topK ?? 10;
        const rrfMap = new Map();
        // 1. Process Dense Vector Ranks (1-based index)
        denseResults.forEach((item, idx) => {
            const rank = idx + 1;
            const key = item.patentId || item.vectorId || `patent-${idx}`;
            const rrfContrib = wVector / (k + rank);
            rrfMap.set(key, {
                patentId: item.patentId,
                title: item.title || `Patent ${item.patentId}`,
                abstract: item.abstract || '',
                claims: item.claims,
                ipc: item.ipc || '',
                country: item.country,
                owner: item.owner,
                publicationDate: item.publicationDate,
                section: item.section,
                vectorScore: item.score,
                bm25Score: 0,
                rrfScore: rrfContrib,
            });
        });
        // 2. Process Sparse BM25 Ranks (1-based index)
        sparseResults.forEach((item, idx) => {
            const rank = idx + 1;
            const key = item.patentId || item.id || `bm25-${idx}`;
            const rrfContrib = wBm25 / (k + rank);
            const existing = rrfMap.get(key);
            if (existing) {
                existing.bm25Score = item.bm25Score;
                existing.rrfScore += rrfContrib;
            }
            else {
                rrfMap.set(key, {
                    patentId: item.patentId,
                    title: item.title || `Patent ${item.patentId}`,
                    abstract: item.abstract || '',
                    claims: item.claims,
                    ipc: item.ipc || '',
                    vectorScore: 0,
                    bm25Score: item.bm25Score,
                    rrfScore: rrfContrib,
                });
            }
        });
        // 3. Convert map to array and sort descending by combined RRF score
        const fusedList = Array.from(rrfMap.values()).sort((a, b) => b.rrfScore - a.rrfScore);
        // 4. Format into SearchResult DTOs with 1-based ranking position
        return fusedList.slice(0, topK).map((item, idx) => ({
            rank: idx + 1,
            score: Number(item.rrfScore.toFixed(4)),
            patentId: item.patentId,
            title: item.title,
            abstract: item.abstract,
            claims: item.claims,
            ipc: item.ipc,
            country: item.country,
            owner: item.owner,
            publicationDate: item.publicationDate,
            section: item.section,
        }));
    }
}
//# sourceMappingURL=rrf-reranker.service.js.map