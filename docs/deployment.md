# PatentIQ - Deployment & Setup Guide

## 🚀 Overview

This guide outlines setup and deployment procedures for PatentIQ across local development environments, staging servers, and production Docker container infrastructure.

---

## 📋 System Prerequisites

Before deploying PatentIQ, ensure your host environment meets the following requirements:

| Component | Minimum Version | Recommended |
| :--- | :--- | :--- |
| **Node.js** | `v20.x` LTS | `v20.11.0` |
| **npm** | `v10.x` | `v10.2.0` |
| **PostgreSQL** | `v15.x` | `v16.x` |
| **Ollama** | `v0.1.20` | Latest |
| **RAM (Local LLM)** | `8 GB` | `16 GB+` (for fast Qwen inference) |
| **Pinecone Account** | Starter / Standard | Serverless Index |

---

## 🛠️ Step-by-Step Local Deployment

### Step 1: Clone Repository
```bash
git clone https://github.com/rithishcodespace/PatentIQ.git
cd PatentIQ
npm install
```

### Step 2: Install and Start Ollama
1. Install Ollama from [ollama.com](https://ollama.com).
2. Start the Ollama local daemon:
   ```bash
   ollama serve
   ```
3. Pull the required embedding and LLM models:
   ```bash
   ollama pull nomic-embed-text
   ollama pull qwen2.5:3b
   ```
4. Verify models are available:
   ```bash
   ollama list
   ```

### Step 3: Set Up PostgreSQL Database
1. Ensure PostgreSQL is running on `localhost:5432`.
2. Create database `patentiq`:
   ```bash
   psql -U postgres -c "CREATE DATABASE patentiq;"
   ```
3. Run Prisma schema migrations:
   ```bash
   npx prisma migrate dev --schema=apps/server/prisma/schema.prisma
   ```

### Step 4: Set Up Pinecone Index
1. Log in to [Pinecone Console](https://app.pinecone.io).
2. Create an index with the following settings:
   - **Index Name**: `patent-embeddings`
   - **Dimensions**: `768`
   - **Metric**: `cosine`
   - **Spec**: `Serverless (aws / us-east-1)`
3. Copy your API Key from the API Keys tab.

### Step 5: Configure Environment Variables
Create `apps/server/.env`:
```env
NODE_ENV=development
PORT=4000
HOST=0.0.0.0
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/patentiq?schema=public
JWT_SECRET=patentiq_super_secret_jwt_key_2026
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=patent-embeddings
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_LLM_MODEL=qwen2.5:3b
STORAGE_TYPE=local
STORAGE_PATH=./storage/uploads
DEFAULT_TOP_K=10
BENCHMARK_ITERATIONS=5
ENABLE_QUERY_CACHE=false
CACHE_TTL_SECONDS=300
```

### Step 6: Start Server
```bash
cd apps/server
npm run dev
```
Verify the server starts and output shows:
```text
Server running at http://0.0.0.0:4000
```

---

## 🐳 Docker Deployment (`docker-compose.yaml`)

PatentIQ includes a production `docker-compose.yaml` for containerized environments:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: patentiq_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: patentiq
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  server:
    build:
      context: .
      dockerfile: Docker/Dockerfile
    container_name: patentiq_server
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgrespassword@postgres:5432/patentiq?schema=public
      - OLLAMA_BASE_URL=http://host.docker.internal:11434
    depends_on:
      - postgres

volumes:
  postgres_data:
```

To deploy with Docker:
```bash
docker-compose up -d --build
```

---

## 🔧 Troubleshooting Guide

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `ECONNREFUSED 127.0.0.1:11434` | Ollama daemon is not running | Run `ollama serve` in a background terminal. |
| `model 'qwen2.5:3b' not found` | Local model has not been pulled | Run `ollama pull qwen2.5:3b`. |
| `Pinecone Unauthorized (401)` | Invalid `PINECONE_API_KEY` | Verify API key in `apps/server/.env`. |
| `Pinecone Index Not Found (404)` | Index name mismatch | Ensure index `patent-embeddings` exists and matches `PINECONE_INDEX_NAME`. |
| `Prisma P1001 Can't reach database` | PostgreSQL is offline or wrong credentials | Verify PostgreSQL is running on port 5432 and test connection with `psql`. |
