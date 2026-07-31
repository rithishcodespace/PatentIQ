# PatentIQ - REST API Reference Documentation

## 🌐 Overview

All PatentIQ APIs communicate over HTTP/HTTPS using standard JSON request and response payloads. The APIs follow REST conventions, enforce strict runtime validation via Zod schemas, and return consistent HTTP status codes.

---

## 🔑 Base URL & Authentication

- **Base URL**: `http://localhost:4000/api` (or `/api/v1`)
- **Content-Type**: `application/json`
- **Authentication**: Protected endpoints require a Bearer token header:
  ```text
  Authorization: Bearer <your_jwt_token>
  ```

---

## 📑 Core API Endpoints

### 1. Semantic Patent Search (`POST /api/search`)

Performs real-time vector similarity search matching a natural language query against indexed Pinecone vector embeddings with optional metadata filtering.

#### Endpoint
`POST /api/search`

#### Request Headers
```http
Content-Type: application/json
```

#### Request Schema & Validation (`SearchRequestDtoSchema`)

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `query` | `string` | **Yes** | Min length: 1 char (trimmed) | Invention query description text |
| `topK` | `number` | No | Integer, `1 <= topK <= 100` | Number of results to return (default `10`) |
| `filters` | `object` | No | Object | Metadata filtering criteria |
| `filters.ipc` | `string` | No | String | IPC classification code filter (e.g. `"H02J"`) |
| `filters.country` | `string` | No | String | Country code filter (e.g. `"US"`) |
| `filters.section` | `string` | No | `"title" \| "abstract" \| "claims"` | Document section filter |
| `filters.publicationDateFrom` | `string` | No | ISO Date string (`YYYY-MM-DD`) | Filter patents published on or after date |
| `filters.publicationDateTo` | `string` | No | ISO Date string (`YYYY-MM-DD`) | Filter patents published on or before date |
| `filters.owner` | `string` | No | String | Patent assignee/owner filter |

#### Request Example
```json
{
    "query": "An autonomous drone charging station using wireless inductive charging",
    "topK": 5,
    "filters": {
        "ipc": "H02J",
        "country": "US"
    }
}
```

#### Response Example (`HTTP 200 OK`)
```json
{
    "success": true,
    "query": "An autonomous drone charging station using wireless inductive charging",
    "count": 1,
    "filters": {
        "ipc": "H02J",
        "country": "US"
    },
    "results": [
        {
            "rank": 1,
            "score": 0.9124,
            "patentId": "US1234567",
            "title": "Autonomous Drone Wireless Charging Pad",
            "abstract": "Inductive charging system for unmanned aerial vehicles...",
            "claims": "Claim 1: A landing pad comprising inductive coils...",
            "ipc": "H02J",
            "country": "US",
            "owner": "AeroCharge Inc",
            "publicationDate": "2024-01-15",
            "section": "Claims",
            "vectorId": "vec_US1234567_claims"
        }
    ],
    "metrics": {
        "queryEmbeddingTimeMs": 42,
        "pineconeSearchTimeMs": 142,
        "totalExecutionTimeMs": 184,
        "totalResults": 1
    }
}
```

---

### 2. Retrieval Benchmarking (`POST /api/search/benchmark`)

Runs multi-query benchmarking over the search engine to measure latency percentiles (P95, P99), throughput, and IR quality metrics.

#### Endpoint
`POST /api/search/benchmark`

#### Request Schema & Validation (`BenchmarkRequestDtoSchema`)

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `queries` | `string[]` | **Yes** | Min 1 query | Array of query strings to benchmark |
| `topK` | `number` | No | Integer, `1 <= topK <= 100` | Top-K per benchmark run (default `10`) |
| `iterations` | `number` | No | Integer, `1 <= iterations <= 50` | Benchmark iterations per query (default `5`) |
| `groundTruth` | `object` | No | `Record<string, string[]>` | Mapping of query strings to relevant patent IDs |

#### Request Example
```json
{
    "queries": [
        "wireless charging",
        "battery management"
    ],
    "topK": 10,
    "iterations": 2,
    "groundTruth": {
        "wireless charging": ["US1234567"]
    }
}
```

#### Response Example (`HTTP 200 OK`)
```json
{
    "success": true,
    "summary": {
        "queries": 4,
        "averageLatency": 210,
        "p95Latency": 295,
        "p99Latency": 310,
        "averageEmbeddingTime": 45,
        "averageSearchTime": 165,
        "averageTotalTime": 210,
        "throughput": 9.5
    },
    "quality": {
        "precisionAt10": 0.5,
        "recallAt10": 1.0,
        "mrr": 1.0,
        "ndcg": 1.0,
        "hitRate": 1.0
    },
    "recommendations": [
        "Embedding generation accounts for 21.4% of total search latency (45ms avg).",
        "Pinecone query latency averages 165ms.",
        "Query caching is currently disabled (ENABLE_QUERY_CACHE=false)."
    ],
    "executionTimeMs": 420
}
```

---

### 3. RAG Novelty & Claim Overlap Analysis (`POST /api/rag/analyze`)

Executes 7-section novelty analysis and section/claim overlap identification using Qwen (`qwen2.5:3b`) via Ollama.

#### Endpoint
`POST /api/rag/analyze`

#### Request Schema & Validation (`RagAnalysisRequestDtoSchema`)

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `query` | `string` | **Yes** | Min length: 5 chars | Invention description to analyze |
| `topK` | `number` | No | Integer, `1 <= topK <= 50` | Retrieved prior-art patents (default `10`) |

#### Request Example
```json
{
    "query": "An autonomous drone charging station using wireless inductive charging",
    "topK": 5
}
```

#### Response Example (`HTTP 200 OK`)
```json
{
    "success": true,
    "query": "An autonomous drone charging station using wireless inductive charging",
    "overlapAnalysis": [
        {
            "patentId": "US1234567",
            "title": "Autonomous Drone Wireless Charging Pad",
            "similarityScore": 0.9124,
            "relevantSections": [
                {
                    "section": "Abstract",
                    "reason": "Describes inductive charging mechanism for UAVs."
                },
                {
                    "section": "Claims",
                    "reason": "Contains inductive power transfer alignment claim."
                }
            ],
            "overlappingClaims": [
                {
                    "claimNumber": 1,
                    "summary": "Landing pad comprising inductive coils for power transfer",
                    "reason": "Uses identical inductive charging coil arrangement as user query",
                    "overlapStrength": "High"
                }
            ]
        }
    ],
    "analysis": {
        "summary": "The user's invention describes an autonomous drone wireless charging station...",
        "similarPatents": [
            {
                "patentId": "US1234567",
                "title": "Autonomous Drone Wireless Charging Pad",
                "similarityScore": 0.9124,
                "relevanceReason": "Direct prior art covering inductive charging pads for UAVs."
            }
        ],
        "featureComparison": {
            "commonFeatures": ["Wireless inductive charging coils", "Landing alignment"],
            "uniqueFeatures": ["Dynamic power level tuning based on drone telemetry"],
            "partialOverlap": ["Thermal heat dissipation system"]
        },
        "novelAspects": ["Telemetry-driven power tuning"],
        "overlappingClaims": ["Claim 1 of US1234567"],
        "risks": ["High risk of 35 U.S.C. 102 anticipation rejection over US1234567"],
        "recommendations": ["Focus patent claims on the unique telemetry feedback loop"]
    }
}
```

---

## 🛑 Standard Error Response Format

All API errors return a standard JSON error response:

#### Example `HTTP 400 Bad Request`
```json
{
    "success": false,
    "error": "BadRequestError",
    "message": "query is required",
    "statusCode": 400
}
```

#### Example `HTTP 503 Service Unavailable`
```json
{
    "success": false,
    "error": "ServiceUnavailableError",
    "message": "Ollama service is unavailable: fetch failed",
    "statusCode": 503
}
```
