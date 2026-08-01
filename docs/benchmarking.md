# PatentIQ - Search Evaluation & Benchmarking Framework

## 📊 Overview

The **Search Evaluation & Benchmarking Framework** (`POST /api/search/benchmark`) provides automated latency measurement, statistical tail analysis (P95, P99), throughput tracking, and Information Retrieval (IR) quality evaluation for PatentIQ.

The framework supports both **unlabeled benchmark runs** (focusing on system latency bottlenecks) and **labeled benchmark runs** using ground truth relevance mapping to track Precision@K, Recall@K, MRR, NDCG, and Hit Rate.

---

## 📈 Supported Metrics Reference

### 1. System Latency & Performance Metrics

| Metric | Calculation / Description | Unit |
| :--- | :--- | :--- |
| **`averageLatency`** | Mean end-to-end request handling time across all query runs | Milliseconds (`ms`) |
| **`p95Latency`** | 95th percentile latency (95% of queries execute faster than this threshold) | Milliseconds (`ms`) |
| **`p99Latency`** | 99th percentile latency (tracks extreme tail latency spikes) | Milliseconds (`ms`) |
| **`averageEmbeddingTime`** | Mean time spent calling Ollama `nomic-embed-text` | Milliseconds (`ms`) |
| **`averageSearchTime`** | Mean time spent executing vector similarity search in Pinecone | Milliseconds (`ms`) |
| **`throughput`** | Total query iterations executed per total elapsed wall-clock second | Requests / second |

### 2. Information Retrieval (IR) Quality Metrics

Computed when an optional `groundTruth` map is passed in the benchmark request payload (matching query text to known relevant patent IDs):

$$\text{Precision@K} = \frac{|\text{Retrieved@K} \cap \text{Ground Truth}|}{K}$$

$$\text{Recall@K} = \frac{|\text{Retrieved@K} \cap \text{Ground Truth}|}{|\text{Ground Truth}|}$$

$$\text{MRR} = \frac{1}{\text{Rank of First Relevant Patent}}$$

$$\text{NDCG@K} = \frac{\text{DCG@K}}{\text{IDCG@K}} \quad \text{where } \text{DCG@K} = \sum_{i=1}^{K} \frac{\text{rel}_i}{\log_2(i + 1)}$$

$$\text{Hit Rate@K} = \begin{cases} 1 & \text{if } |\text{Retrieved@K} \cap \text{Ground Truth}| > 0 \\ 0 & \text{otherwise} \end{cases}$$

> *Note*: If `groundTruth` is omitted, all quality metrics default to `null`.

---

## 🔬 Benchmark API Usage (`POST /api/search/benchmark`)

### Example Request with Ground Truth Relevance Mapping
```json
{
    "queries": [
        "wireless charging pad for drones",
        "battery energy management system"
    ],
    "topK": 10,
    "iterations": 5,
    "groundTruth": {
        "wireless charging pad for drones": ["US1234567", "US9876543"],
        "battery energy management system": ["US5554433"]
    }
}
```

### Example Structured Benchmark Report Output
```json
{
    "success": true,
    "summary": {
        "queries": 10,
        "averageLatency": 215,
        "p95Latency": 298,
        "p99Latency": 325,
        "averageEmbeddingTime": 48,
        "averageSearchTime": 167,
        "averageTotalTime": 215,
        "throughput": 8.4
    },
    "quality": {
        "precisionAt10": 0.2000,
        "recallAt10": 1.0000,
        "mrr": 1.0000,
        "ndcg": 0.8500,
        "hitRate": 1.0000
    },
    "recommendations": [
        "Embedding generation accounts for 22.3% of total search latency (48ms avg).",
        "Pinecone query latency averages 167ms.",
        "Query caching is currently disabled (ENABLE_QUERY_CACHE=false). Enabling query cache with a 300s TTL can significantly reduce latency for repeated benchmark queries."
    ],
    "executionTimeMs": 1190
}
```

---

## 💡 Automated Performance Recommendations Engine

The framework automatically analyzes metric ratios and generates actionable advice:

1. **Embedding Bottlenecks**: Triggers a alert if embedding generation accounts for > 40% of total request latency, recommending batching or GPU acceleration.
2. **Pinecone Query Latency**: Triggers an alert if Pinecone query latency exceeds 500ms, suggesting topK reduction or index pod scaling.
3. **Tail Latency Spikes**: Identifies network instability when `P95 > 1.8 * AverageLatency`.
4. **Cache Optimization**: Recommends enabling `ENABLE_QUERY_CACHE` when query repetition is detected.
