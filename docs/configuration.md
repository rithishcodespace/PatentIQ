# PatentIQ - Environment Configuration Reference

## ⚙️ Overview

PatentIQ manages environment configuration using **Zod schema parsing** and `dotenv` in `src/config/env.config.ts`. All environment variables are validated at server initialization. If a required variable is missing or malformed, the process fails fast with an explicit error message.

---

## 📋 Comprehensive Variable Reference

| Variable Name | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| **`NODE_ENV`** | `string` | `"development"` | Node execution environment (`development`, `production`, `test`) |
| **`PORT`** | `number` | `4000` | HTTP server listening port |
| **`HOST`** | `string` | `"0.0.0.0"` | Network bind address |
| **`DATABASE_URL`** | `string` | `"postgresql://..."` | PostgreSQL connection string for Prisma ORM |
| **`JWT_SECRET`** | `string` | `"patentiq_super..."` | Secret key for signing and verifying JWT auth tokens |
| **`PINECONE_API_KEY`** | `string` | `""` | API key for Pinecone cloud vector database |
| **`PINECONE_INDEX_NAME`** | `string` | `"patent-embeddings"` | Pinecone target vector index name |
| **`OLLAMA_BASE_URL`** | `string` | `"http://localhost:11434"` | HTTP endpoint for local Ollama AI daemon |
| **`OLLAMA_EMBEDDING_MODEL`**| `string` | `"nomic-embed-text"` | Target embedding model hosted in Ollama (768-dim) |
| **`OLLAMA_LLM_MODEL`** | `string` | `"qwen2.5:3b"` | Target LLM for RAG novelty & overlap analysis |
| **`STORAGE_TYPE`** | `string` | `"local"` | Storage driver (`local` or `s3`) |
| **`STORAGE_PATH`** | `string` | `"./storage/uploads"` | Path for uploaded patent documents and PDF attachments |
| **`DEFAULT_TOP_K`** | `number` | `10` | Default Top-K retrieval count for search & benchmarking |
| **`BENCHMARK_ITERATIONS`** | `number` | `5` | Default query iteration count for `/api/search/benchmark` |
| **`ENABLE_QUERY_CACHE`** | `boolean` | `false` | Enables memory caching for repeat search queries |
| **`CACHE_TTL_SECONDS`** | `number` | `300` | Expiration time for cached search queries (in seconds) |

---

## 📄 Complete `.env.example` Template

Copy and paste the following template into `apps/server/.env`:

```env
# ==============================================================================
# PatentIQ Server Environment Configuration
# ==============================================================================

# Server Infrastructure
NODE_ENV=development
PORT=4000
HOST=0.0.0.0

# Relational Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/patentiq?schema=public

# Security & Authentication
JWT_SECRET=patentiq_super_secret_jwt_key_2026

# Vector Store (Pinecone)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=patent-embeddings

# Local AI Models (Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_LLM_MODEL=qwen2.5:3b

# File Storage
STORAGE_TYPE=local
STORAGE_PATH=./storage/uploads

# Search & Benchmarking Configuration
DEFAULT_TOP_K=10
BENCHMARK_ITERATIONS=5
ENABLE_QUERY_CACHE=false
CACHE_TTL_SECONDS=300
```
