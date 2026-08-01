# ⚡ PatentIQ — AI-Powered Patent Prior-Art Search & Confidence Analysis Engine

> **PatentIQ** is an enterprise-grade, full-stack AI platform for automated patent prior-art retrieval, semantic claim analysis, metadata filtering, and RAG-driven novelty scoring.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Documentation Index](#-documentation-index)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Installation](#installation)
  - [Database & Vector Store Setup](#database--vector-store-setup)
  - [Running the Applications](#running-the-applications)
- [CLI Scripts & Dataset Tools](#-cli-scripts--dataset-tools)
- [API Documentation & Endpoints](#-api-documentation--endpoints)
- [Benchmarking & Evaluation](#-benchmarking--evaluation)
- [Testing](#-testing)
- [License](#-license)

---

## 🔬 Overview

Patent prior-art searching traditionally requires laborious manual Boolean queries across massive patent databases. **PatentIQ** modernizes patent analysis by combining dense vector embeddings with metadata-filtered similarity retrieval and Retrieval-Augmented Generation (RAG). 

It evaluates patent claims against prior art using local LLMs (`qwen2.5:3b` / `llama3`), calculates a heuristic **Confidence Score** across multiple dimensions (retrieval precision, vector similarity distance, section matching, and LLM certainty), and presents actionable technical insights through an interactive 3D command center interface.

---

## ✨ Key Features

- 🔍 **Semantic Prior-Art Search**: Dense vector search powered by **Pinecone** and **Ollama** embeddings (`nomic-embed-text`).
- 🎯 **Granular Metadata Filtering**: Filter prior-art queries by IPC classification codes, country/jurisdiction, publication date range, assignee/owner, and document sections (claims, abstract, description).
- 🧠 **RAG Novelty & Prior-Art Analysis**: Automated AI evaluation of technical novelty, non-obviousness risks, overlapping claim elements, and technical differentiators using `qwen2.5:3b`.
- 📊 **Heuristic Confidence Scoring Engine**: Multi-metric scoring system evaluating retrieval precision/recall, vector distance, and LLM certainty mapped to qualitative confidence indicators.
- 💾 **Search History & Persistence Layer**: Atomic transaction storage via **Prisma ORM** and **PostgreSQL** to log user search sessions, retrieved patent metadata, and novelty reports.
- ⚡ **Dataset Pipelines & Benchmarking**: Built-in CLI tooling for dataset cleaning, section extraction, vector embedding generation, Pinecone batch ingestion, and retrieval benchmarking (Precision@K, Recall@K, MRR, NDCG, Latency P95/P99).
- 🎨 **Modern Interactive UI**: High-density command center built with **React 19**, **Vite**, **Tailwind CSS v4**, **Framer Motion**, and **Three.js** 3D visualizer in a cohesive Slate/Indigo theme.

---

## 🏗️ Architecture & Tech Stack

PatentIQ follows **Clean Architecture** with strict Dependency Injection (DI) and modular separation of transport, domain, and infrastructure layers.

```
┌─────────────────────────────────────────────────────────┐
│                    React 19 Client                      │
│        (Vite + TailwindCSS + Framer Motion + 3D)        │
└────────────────────────────┬────────────────────────────┘
                             │ REST API (/api/v1/*)
┌────────────────────────────▼────────────────────────────┐
│                    Fastify Server                       │
│    (Dependency Injection Container + Zod Validation)    │
└────────┬───────────────────┬───────────────────┬────────┘
         │                   │                   │
┌────────▼────────┐ ┌────────▼────────┐ ┌────────▼────────┐
│  Pinecone DB    │ │  PostgreSQL DB  │ │   Ollama LLM   │
│ (Vector Search) │ │ (Prisma ORM)    │ │ (Embed & RAG)  │
└─────────────────┘ └─────────────────┘ └────────────────┘
```

### Backend (`apps/server`)
- **Runtime**: Node.js & TypeScript
- **Web Framework**: Fastify v5 (with CORS, Helmet, Rate Limit, Swagger OpenAPI, Multipart)
- **Database & ORM**: PostgreSQL & Prisma ORM v7
- **Vector Database**: Pinecone Database SDK (`dimension: 768`, `metric: cosine`)
- **LLM & Embeddings**: Ollama (`nomic-embed-text`, `qwen2.5:3b` / `llama3`)
- **Validation**: Zod schema validation & DTO typing
- **Testing**: Vitest & Supertest

### Frontend (`apps/client`)
- **Framework**: React 19 & TypeScript
- **Build Tool**: Vite v8
- **Styling**: Tailwind CSS v4
- **Animations & 3D**: Framer Motion & Three.js / React Three Fiber
- **Icons & UI**: Lucide React

---

## 📁 Project Structure

```
PatentIQ/
├── apps/
│   ├── client/                  # React 19 Frontend SPA
│   │   ├── src/
│   │   │   ├── components/      # UI components (ResultCard, ConfidenceDashboard, 3D Canvas)
│   │   │   ├── pages/           # Search, Results, History, HowItWorks, Docs
│   │   │   ├── services/        # REST API service client integrations
│   │   │   └── types/           # TypeScript type definitions
│   │   └── package.json
│   │
│   └── server/                  # Fastify Backend API Server
│       ├── src/
│       │   ├── common/          # Middleware, DTO schemas, custom error classes
│       │   ├── config/          # Environment variables & service configs
│       │   ├── modules/         # Clean Architecture feature modules
│       │   │   ├── admin/       # System metrics & admin management
│       │   │   ├── analytics/   # Usage & performance telemetry
│       │   │   ├── auth/        # JWT Authentication & user authorization
│       │   │   ├── confidence/  # Confidence scoring heuristic module
│       │   │   ├── embeddings/  # Vector embedding generation & batching
│       │   │   ├── history/     # Search & RAG analysis persistence
│       │   │   ├── patents/     # Patent ingestion & dataset processing
│       │   │   ├── rag/         # RAG novelty analysis & candidate ranking
│       │   │   ├── reports/     # Report generation & exports
│       │   │   ├── search/      # Pinecone semantic search & filtering
│       │   │   ├── uploads/     # PDF document parsing & extraction
│       │   │   └── users/       # User profile management
│       │   ├── plugins/         # Fastify core plugins & DI container
│       │   ├── providers/       # Vector DB & LLM provider implementations
│       │   └── app.ts           # Fastify application factory
│       ├── tests/               # Unit & integration test suites
│       └── package.json
│
├── docs/                        # Deep-dive architecture & API technical guides
└── README.md
```

---

## 📚 Documentation Index

Detailed technical specifications and architectural guides are available in the [`docs/`](./docs) directory:

| Document | Description |
| :--- | :--- |
| 🏛️ **[System Architecture](./docs/architecture.md)** | Clean Architecture, Dependency Injection container, and request lifecycle |
| 🔌 **[REST API Specifications](./docs/api.md)** | Request/response DTO schemas, endpoints, and OpenAPI specs |
| 🔍 **[Semantic Search Pipeline](./docs/search-pipeline.md)** | Vector embedding generation, Pinecone index querying, and metadata filters |
| 🤖 **[RAG Novelty Pipeline](./docs/rag-pipeline.md)** | 7-section structured prompts, claim overlap matrix, and anti-hallucination rules |
| 📊 **[Benchmarking & Metrics](./docs/benchmarking.md)** | Precision@K, Recall@K, MRR, NDCG calculation, and latency percentiles |
| ⚙️ **[Configuration Reference](./docs/configuration.md)** | Detailed breakdown of environment variables and service credentials |
| 🚀 **[Deployment Guide](./docs/deployment.md)** | Local environment setup, database migrations, and operational guidelines |
| 📁 **[Project Structure Taxonomy](./docs/project-structure.md)** | Directory taxonomy, module relationships, and contribution standards |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: `v20+`
- **npm** (or **pnpm**)
- **PostgreSQL**: `v15+`
- **Ollama**: Running locally with required models:
  ```bash
  ollama pull nomic-embed-text
  ollama pull qwen2.5:3b
  ```
- **Pinecone Account**: API Key and an index configured (`dimension: 768`, `metric: cosine`)

### Environment Setup

1. Copy `.env.example` inside `apps/server/` to `.env`:

```bash
cp apps/server/.env.example apps/server/.env
```

2. Configure environment variables in `apps/server/.env`:

```env
NODE_ENV=development
PORT=4000
HOST=0.0.0.0

# Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/patent_iq?schema=public"

# JWT Authentication
JWT_SECRET="patentiq_super_secret_jwt_key_2026"

# Pinecone Vector DB
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX_NAME="patent-embeddings"

# Ollama Local LLM & Embedding Models
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_EMBEDDING_MODEL="nomic-embed-text"
OLLAMA_LLM_MODEL="qwen2.5:3b"

# File Storage & Search Defaults
STORAGE_TYPE="local"
STORAGE_PATH="./storage/uploads"
DEFAULT_TOP_K=10
BENCHMARK_ITERATIONS=5
ENABLE_QUERY_CACHE=false
CACHE_TTL_SECONDS=300
```

### Installation

Install workspace dependencies from the project root:

```bash
npm install
```

### Database & Vector Store Setup

Run Prisma migrations to initialize PostgreSQL database schemas:

```bash
cd apps/server
npx prisma migrate dev --name init
npx prisma generate
```

### Running the Applications

Start the Fastify backend server and React frontend client:

```bash
# Start Backend API Server (Runs on http://localhost:4000)
cd apps/server
npm run dev

# Start Frontend UI Client (Runs on http://localhost:5173)
cd apps/client
npm run dev
```

---

## 🛠️ CLI Scripts & Dataset Tools

PatentIQ includes built-in CLI scripts in `apps/server` to process, embed, and benchmark patent datasets:

```bash
cd apps/server
```

| Script Command | Purpose & Description |
| :--- | :--- |
| `npm run clean-dataset` | Cleans raw CSV/JSON patent datasets and normalizes metadata schemas |
| `npm run extract-sections` | Extracts claims, abstracts, descriptions, and metadata into structured JSON |
| `npm run generate-embeddings` | Generates 768-dim vector embeddings for extracted sections via Ollama |
| `npm run upload-pinecone` | Batch uploads processed vector embeddings and metadata to Pinecone |
| `npm run semantic-search` | Executes interactive CLI test queries against the Pinecone vector index |
| `npm run benchmark-search` | Measures Precision@K, Recall@K, MRR, NDCG, and latency metrics |

---

## 📖 API Documentation & Endpoints

Interactive OpenAPI / Swagger documentation is available when the server is running at:
👉 **`http://localhost:4000/documentation`**

### Summary of REST API Endpoints

#### 🔍 Semantic Search & RAG
- `POST /api/v1/search`: Vector similarity search with optional metadata filters (IPC, country, date, assignee).
- `POST /api/v1/search/benchmark`: Execute multi-query benchmarking and return IR quality metrics.
- `POST /api/v1/search/prior-art`: Execute prior art evaluation over query.
- `POST /api/v1/rag/analyze`: Perform 7-section RAG novelty analysis & section/claim overlap breakdown.
- `POST /api/v1/rag/rank`: Hybrid candidate reranking over retrieved prior-art candidates.

#### 🔑 Authentication (`/api/v1/auth`)
- `POST /register`: Register a new user account.
- `POST /login`: Authenticate and receive JWT access/refresh tokens.
- `POST /refresh`: Refresh expired access tokens.
- `POST /logout`: Invalidate user session tokens.

#### 💾 History & Persistence (`/api/v1/history`)
- `GET /`: Retrieve paginated search history sessions for user.
- `GET /:id`: Fetch detailed search session, prior art matches, and RAG reports.
- `DELETE /:id`: Delete search session entry.

#### 📄 Patents & Uploads (`/api/v1/patents`, `/api/v1/uploads`)
- `POST /api/v1/patents`: Ingest new patent record into relational database.
- `GET /api/v1/patents`: List ingested patents with metadata pagination.
- `GET /api/v1/patents/:id`: Retrieve detailed patent by ID.
- `POST /api/v1/uploads`: Upload and parse patent PDF documents for instant prior-art analysis.

#### ⚡ Vector Embeddings & System Metrics (`/api/v1/embeddings`, `/api/v1/admin`, `/api/v1/analytics`)
- `POST /api/v1/embeddings/generate`: Generate vector embedding for input text.
- `POST /api/v1/embeddings/batch`: Batch vector embedding generation.
- `GET /api/v1/admin/status`: System operational status and index stats.
- `POST /api/v1/admin/clear-cache`: Purge active query response cache.
- `GET /api/v1/analytics/overview`: Usage statistics, query performance, and retrieval latency metrics.

#### 🩺 Health Checks
- `GET /health`: Overall server health and operational status.
- `GET /health/postgres`: PostgreSQL database connectivity status.
- `GET /health/pinecone`: Pinecone vector store API status.
- `GET /health/ollama`: Ollama local LLM service status.

---

## 📊 Benchmarking & Evaluation

PatentIQ features an evaluation module designed to measure retrieval efficiency and execution latency:

- **Precision@K & Recall@K**: Evaluates top-K document relevance against ground-truth benchmarks.
- **MRR (Mean Reciprocal Rank)**: Evaluates the rank placement of the first relevant patent result.
- **NDCG (Normalized Discounted Cumulative Gain)**: Measures ranked retrieval effectiveness.
- **System Latency Instrumentation**: Benchmarks execution time breakdown across embedding generation, vector similarity search, and database persistence (P95 / P99 latency percentiles).

---

## 🧪 Testing

Run backend unit and integration test suites using Vitest:

```bash
cd apps/server

# Run all unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run full test coverage report
npm run test:coverage
```

---

## 📄 License

This project is licensed under the **ISC License**.

