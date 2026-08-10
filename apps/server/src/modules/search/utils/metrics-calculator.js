export class MetricsCalculator {
    /**
     * Calculates performance summary statistics (Average, P95, P99, Throughput).
     */
    static calculateSummary(metrics, totalExecutionTimeMs) {
        if (metrics.length === 0) {
            return {
                queries: 0,
                averageLatency: 0,
                p95Latency: 0,
                p99Latency: 0,
                averageEmbeddingTime: 0,
                averageSearchTime: 0,
                averageTotalTime: 0,
                throughput: 0,
            };
        }
        const totalRuns = metrics.length;
        const totalLatencies = metrics.map((m) => m.totalTimeMs).sort((a, b) => a - b);
        const embeddingTimes = metrics.map((m) => m.embeddingTimeMs);
        const searchTimes = metrics.map((m) => m.searchTimeMs);
        const averageLatency = Math.round(this.average(totalLatencies));
        const averageEmbeddingTime = Math.round(this.average(embeddingTimes));
        const averageSearchTime = Math.round(this.average(searchTimes));
        const averageTotalTime = averageLatency;
        const p95Latency = Math.round(this.percentile(totalLatencies, 95));
        const p99Latency = Math.round(this.percentile(totalLatencies, 99));
        const totalSeconds = totalExecutionTimeMs > 0 ? totalExecutionTimeMs / 1000 : 1;
        const throughput = Number((totalRuns / totalSeconds).toFixed(1));
        return {
            queries: totalRuns,
            averageLatency,
            p95Latency,
            p99Latency,
            averageEmbeddingTime,
            averageSearchTime,
            averageTotalTime,
            throughput,
        };
    }
    /**
     * Computes Information Retrieval (IR) quality metrics (Precision@K, Recall@K, MRR, NDCG@K, Hit Rate@K).
     * Returns null for all fields if groundTruth map is empty or undefined.
     */
    static calculateQualityMetrics(metrics, groundTruth, topK = 10) {
        if (!groundTruth || Object.keys(groundTruth).length === 0) {
            return {
                precisionAt10: null,
                recallAt10: null,
                precisionAtK: null,
                recallAtK: null,
                mrr: null,
                ndcg: null,
                hitRate: null,
            };
        }
        const precisions = [];
        const recalls = [];
        const mrrs = [];
        const ndcgs = [];
        const hitRates = [];
        // Group metrics by query string
        const queryMap = new Map();
        for (const m of metrics) {
            if (!queryMap.has(m.query)) {
                queryMap.set(m.query, m.retrievedPatentIds);
            }
        }
        for (const [query, retrievedIds] of queryMap.entries()) {
            const relevantList = groundTruth[query] || groundTruth[query.trim().toLowerCase()];
            if (!relevantList || relevantList.length === 0) {
                continue;
            }
            const relevantSet = new Set(relevantList.map((id) => id.trim().toUpperCase()));
            const kRetrieved = retrievedIds.slice(0, topK).map((id) => id.trim().toUpperCase());
            // 1. Precision@K
            let relevantCount = 0;
            for (const id of kRetrieved) {
                if (relevantSet.has(id)) {
                    relevantCount++;
                }
            }
            const precision = kRetrieved.length > 0 ? relevantCount / kRetrieved.length : 0;
            precisions.push(precision);
            // 2. Recall@K
            const recall = relevantSet.size > 0 ? relevantCount / relevantSet.size : 0;
            recalls.push(recall);
            // 3. MRR (Mean Reciprocal Rank)
            let reciprocalRank = 0;
            for (let i = 0; i < kRetrieved.length; i++) {
                const retrievedId = kRetrieved[i];
                if (retrievedId && relevantSet.has(retrievedId)) {
                    reciprocalRank = 1 / (i + 1);
                    break;
                }
            }
            mrrs.push(reciprocalRank);
            // 4. NDCG@K
            let dcg = 0;
            for (let i = 0; i < kRetrieved.length; i++) {
                const retrievedId = kRetrieved[i];
                if (retrievedId && relevantSet.has(retrievedId)) {
                    dcg += 1 / Math.log2(i + 2); // i+2 because log2(1)=0 so rank 1 index 0 uses log2(2)=1
                }
            }
            let idcg = 0;
            const idealCount = Math.min(relevantSet.size, topK);
            for (let j = 0; j < idealCount; j++) {
                idcg += 1 / Math.log2(j + 2);
            }
            const ndcg = idcg > 0 ? dcg / idcg : 0;
            ndcgs.push(ndcg);
            // 5. Hit Rate@K
            const hitRate = relevantCount > 0 ? 1 : 0;
            hitRates.push(hitRate);
        }
        if (precisions.length === 0) {
            return {
                precisionAt10: null,
                recallAt10: null,
                precisionAtK: null,
                recallAtK: null,
                mrr: null,
                ndcg: null,
                hitRate: null,
            };
        }
        const avgPrecision = Number(this.average(precisions).toFixed(4));
        const avgRecall = Number(this.average(recalls).toFixed(4));
        return {
            precisionAt10: avgPrecision,
            recallAt10: avgRecall,
            precisionAtK: avgPrecision,
            recallAtK: avgRecall,
            mrr: Number(this.average(mrrs).toFixed(4)),
            ndcg: Number(this.average(ndcgs).toFixed(4)),
            hitRate: Number(this.average(hitRates).toFixed(4)),
        };
    }
    /**
     * Generates actionable performance recommendations based on metric thresholds.
     */
    static generateRecommendations(summary, quality, cacheEnabled) {
        const recommendations = [];
        if (summary.queries === 0) {
            return ['No query metrics were recorded during benchmarking.'];
        }
        // 1. Embedding Overhead Analysis
        const totalAvgTime = summary.averageTotalTime > 0 ? summary.averageTotalTime : 1;
        const embeddingRatio = (summary.averageEmbeddingTime / totalAvgTime) * 100;
        recommendations.push(`Embedding generation accounts for ${embeddingRatio.toFixed(1)}% of total search latency (${summary.averageEmbeddingTime}ms avg).`);
        if (embeddingRatio > 40) {
            recommendations.push('High embedding overhead detected. Consider batching embedding requests or deploying a dedicated local GPU embedding service.');
        }
        // 2. Vector Search Latency Analysis
        recommendations.push(`Pinecone query latency averages ${summary.averageSearchTime}ms.`);
        if (summary.averageSearchTime > 500) {
            recommendations.push('Pinecone query latency exceeds 500ms. Consider reducing requested topK or evaluating index pod capacity.');
        }
        // 3. Tail Latency Analysis (P95 / P99)
        if (summary.p95Latency > summary.averageLatency * 1.8) {
            recommendations.push(`Tail latency spike detected: P95 latency (${summary.p95Latency}ms) is significantly higher than average (${summary.averageLatency}ms). Review network connection stability to Pinecone.`);
        }
        // 4. Caching Recommendation
        if (!cacheEnabled) {
            recommendations.push('Query caching is currently disabled (ENABLE_QUERY_CACHE=false). Enabling query cache with a 300s TTL can significantly reduce latency for repeated benchmark queries.');
        }
        else {
            recommendations.push('Query caching is active. Repeated benchmark queries benefit from sub-millisecond retrieval.');
        }
        // 5. Quality Metrics Feedback
        if (quality.precisionAt10 !== null) {
            if (quality.precisionAt10 < 0.5) {
                recommendations.push(`Precision@K is low (${quality.precisionAt10}). Consider tuning hybrid weights (BM25 + Semantic) or cross-encoder reranking.`);
            }
            else {
                recommendations.push(`Retrieval Quality: High Precision@K (${quality.precisionAt10}) and NDCG (${quality.ndcg}).`);
            }
        }
        return recommendations;
    }
    /**
     * Helper utility calculating average of an array of numbers.
     */
    static average(numbers) {
        if (numbers.length === 0)
            return 0;
        const sum = numbers.reduce((acc, val) => acc + val, 0);
        return sum / numbers.length;
    }
    /**
     * Helper utility calculating percentile value from a sorted array of numbers.
     */
    static percentile(sortedNumbers, p) {
        if (sortedNumbers.length === 0)
            return 0;
        const index = Math.ceil((p / 100) * sortedNumbers.length) - 1;
        const safeIndex = Math.max(0, Math.min(index, sortedNumbers.length - 1));
        return sortedNumbers[safeIndex] ?? 0;
    }
}
//# sourceMappingURL=metrics-calculator.js.map