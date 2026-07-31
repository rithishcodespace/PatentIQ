# PatentIQ - Project Structure & Code Conventions Documentation

## 📁 Repository Directory Layout

PatentIQ is organized as a monorepo structured for clean separation of backend server modules, database schemas, deployment containers, and technical documentation.

```text
PatentIQ/
├── Docker/                      # Dockerfile and container build contexts
├── docs/                        # Complete technical documentation suite
│   ├── README.md                # Documentation portal & executive summary
│   ├── architecture.md          # System architecture, DI, and sequence diagrams
│   ├── search-pipeline.md       # Semantic vector search & metadata filtering docs
│   ├── rag-pipeline.md          # RAG novelty & claim overlap analysis docs
│   ├── api.md                   # Complete REST API reference and DTO schemas
│   ├── deployment.md            # Local & Docker deployment guide
│   ├── configuration.md         # Environment variables & configuration guide
│   ├── benchmarking.md          # Retrieval evaluation & latency benchmarking
│   └── project-structure.md     # Project taxonomy & developer coding standards
├── apps/
│   └── server/                  # Fastify/TypeScript Backend Application
│       ├── prisma/              # Prisma schema & migration scripts
│       └── src/                 # Application source code
│           ├── common/          # Global middleware, errors, and utility functions
│           ├── config/          # Zod environment config & database client
│           ├── modules/         # Modular feature domains
│           ├── plugins/         # Fastify plugins (DI Container, CORS, Auth)
│           ├── providers/       # Infrastructure providers (Pinecone, Ollama)
│           ├── storage/         # Local & S3 file storage providers
│           ├── app.ts           # Fastify application builder factory
│           └── server.ts        # Node.js process entrypoint
├── docker-compose.yaml          # Multi-container orchestration specification
└── package.json                 # Monorepo dependencies & script targets
```

---

## 🧩 Backend Modules Breakdown (`apps/server/src/modules/`)

Each module follows Clean Architecture by segregating controllers, services, repositories, DTOs, and prompt builders:

| Module | Primary Responsibilities | Key Files |
| :--- | :--- | :--- |
| **`search`** | Semantic vector similarity search, Pinecone filter construction, and latency benchmarking | `search.controller.ts`, `search.service.ts`, `search.repository.ts`, `benchmark.service.ts`, `metrics-calculator.ts` |
| **`rag`** | Concurrent RAG novelty analysis, section/claim overlap identification, and LLM prompt generation | `rag.controller.ts`, `rag.service.ts`, `novelty-analysis.service.ts`, `overlap-analysis.service.ts`, `novelty-analysis.prompt.ts`, `overlap-analysis.prompt.ts` |
| **`patents`** | Patent metadata parsing, extraction, and PostgreSQL persistence | `patent.service.ts`, `patents.repository.ts`, `patent-parser.service.ts` |
| **`embeddings`**| Vector embedding batching and Pinecone index sync management | `embeddings.service.ts`, `embeddings.controller.ts` |
| **`reports`** | PDF and JSON patentability report generation | `reports.service.ts`, `reports.controller.ts` |
| **`auth`** | User authentication, registration, password hashing, and JWT signing | `auth.service.ts`, `auth.controller.ts` |
| **`users`** | User profile management and role-based access controls | `users.service.ts`, `users.controller.ts` |
| **`uploads`** | File upload processing (patent PDFs and datasets) | `uploads.service.ts`, `uploads.controller.ts` |
| **`analytics`**| Aggregated platform search metrics and system analytics | `analytics.service.ts` |
| **`admin`** | Index administration and vector database status management | `admin.service.ts` |

---

## 📜 Coding Standards & Developer Guidelines

### 1. TypeScript Strict Mode
- Strict null checks (`strictNullChecks: true`) and explicit return types on all functions and methods.
- `any` types are prohibited; use strongly-typed interfaces or Zod DTO inference (`z.infer<typeof Schema>`).

### 2. Dependency Injection & Testability
- High-level modules depend on abstractions (interfaces like `ISearchService`, `ILLMProvider`), not concrete classes.
- Dependencies are passed via constructor injection.

### 3. Error Handling Rules
- Never return raw database or HTTP client errors to clients.
- Catch external errors (e.g., Ollama fetch failures) and throw typed HTTP domain errors (`ServiceUnavailableError`).

### 4. Logging Strategy
- Use Fastify's built-in Pino logger (`request.log.info(...)`).
- Log execution telemetry (query length, result count, durationMs) without logging sensitive PII or full text payloads.

---

## 🔮 Future Enhancements & Architecture Roadmap

The following architectural enhancements are planned for future releases:

1. **Hybrid Retrieval (BM25 + Dense Vector Search)**: Integrating sparse BM25 keyword matching with Pinecone dense vector retrieval for improved domain-specific recall.
2. **Cross-Encoder Candidate Reranking**: Re-scoring top-50 candidate patents using a local cross-encoder model before feeding context into Qwen.
3. **Streaming LLM Responses (SSE)**: Implementing Server-Sent Events for streaming Qwen novelty analysis tokens to the frontend in real time.
4. **Citation-Aware RAG**: Automated cross-referencing between novelty report claims and specific prior-art patent claims.
5. **Distributed Vector Indexing**: Multi-region index sharding for scaling beyond 10 million patent vectors.
