import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from '../config/env.config.js';
export default fp(async (fastify) => {
    await fastify.register(swagger, {
        openapi: {
            openapi: '3.1.0',
            info: {
                title: 'PatentIQ API',
                description: `AI-powered Patent Prior-Art Search Engine REST API developer documentation.

### Core Modules
- **Authentication**: JWT token generation, user registration, login, and session refresh.
- **Search**: High-performance semantic vector search with metadata filtering powered by Pinecone.
- **RAG**: Grounded 7-section novelty analysis & claim overlap detection powered by Ollama Qwen 2.5.
- **History**: Atomic PostgreSQL persistence for search queries, match candidates, and novelty reports.
- **Upload**: Ingestion and automated extraction for PDF, DOCX, and TXT patent documents.
- **Benchmark**: Retrieval effectiveness (Precision@K, Recall@K, MRR, NDCG) & P95/P99 latency profiling.

### Infrastructure & Environment Configuration
- **PORT**: Web server listening port (Default: \`5000\`)
- **DATABASE_URL**: PostgreSQL connection URL (\`postgresql://postgres:password@localhost:5432/patent_iq\`)
- **JWT_SECRET**: Secret key for signing and validating JWT tokens
- **PINECONE_API_KEY**: Pinecone vector database API access key
- **PINECONE_INDEX_NAME**: Pinecone index storing patent embeddings
- **OLLAMA_BASE_URL**: Ollama LLM service URL (\`http://localhost:11434\`)
- **OLLAMA_MODEL**: LLM model for novelty analysis (\`qwen2.5:3b\`)`,
                version: '1.0.0',
                contact: {
                    name: 'PatentIQ Engineering Team',
                    email: 'support@patentiq.ai',
                    url: 'https://github.com/rithishcodespace/PatentIQ',
                },
                license: {
                    name: 'MIT',
                    url: 'https://opensource.org/licenses/MIT',
                },
            },
            servers: [
                {
                    url: `http://localhost:${env.PORT || 5000}`,
                    description: 'Local Development Server',
                },
            ],
            tags: [
                { name: 'Authentication', description: 'User authentication, registration, JWT login & refresh tokens' },
                { name: 'Search', description: 'Semantic vector similarity search over patent prior art' },
                { name: 'RAG', description: 'Grounded 7-section AI novelty analysis & claim overlap detection via Qwen' },
                { name: 'History', description: 'Search history persistence, paginated listing, filtering, reuse & deletion' },
                { name: 'Upload', description: 'Patent document ingestion and section parsing (PDF, DOCX, TXT)' },
                { name: 'Benchmark', description: 'Retrieval accuracy evaluation & system latency profiling (P95/P99)' },
                { name: 'Health', description: 'Infrastructure component readiness checks (PostgreSQL, Pinecone, Ollama)' },
                { name: 'Users', description: 'User profile management & account operations' },
                { name: 'Reports', description: 'Novelty report generation & PDF retrieval' },
                { name: 'Embeddings', description: 'Vector embedding generation via nomic-embed-text' },
                { name: 'Analytics', description: 'Search activity statistics & metrics overview' },
                { name: 'Admin', description: 'Index reindexing & system cache management' },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'Enter JWT access token in the format: `Bearer <token>`',
                    },
                },
            },
        },
    });
    await fastify.register(swaggerUi, {
        routePrefix: '/docs',
        initOAuth: {},
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
            displayRequestDuration: true,
            persistAuthorization: true,
            filter: true,
            tryItOutEnabled: true,
            syntaxHighlight: {
                activate: true,
                theme: 'monokai',
            },
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
    });
});
//# sourceMappingURL=swagger.plugin.js.map