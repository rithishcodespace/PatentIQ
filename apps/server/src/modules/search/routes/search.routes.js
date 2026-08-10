import { SearchController } from '../controllers/search.controller.js';
import { BenchmarkController } from '../controllers/benchmark.controller.js';
import { SearchRequestSchema, SearchResponseSchema, BenchmarkRequestSchema, BenchmarkResponseSchema, standardErrorResponses, } from '../../../common/schemas/swagger.schemas.js';
export async function searchRoutes(fastify, controller, benchmarkController) {
    // POST /api/search or POST /api/v1/search - Semantic vector similarity search
    fastify.post('/', {
        schema: {
            tags: ['Search'],
            summary: 'Semantic Prior-Art Patent Search',
            description: 'Executes real-time semantic vector similarity search against Pinecone index with optional metadata filters (IPC, country, date, owner). Automatically persists search queries and retrieved matches to PostgreSQL.',
            body: SearchRequestSchema,
            response: {
                200: SearchResponseSchema,
                400: standardErrorResponses[400],
                429: standardErrorResponses[429],
                500: standardErrorResponses[500],
            },
        },
        handler: (req, reply) => controller.search(req, reply),
    });
    // POST /api/search/benchmark - Search evaluation benchmark
    fastify.post('/benchmark', {
        schema: {
            tags: ['Benchmark'],
            summary: 'Evaluate Retrieval Accuracy & System Latency Benchmark',
            description: 'Executes retrieval benchmark evaluating Precision@K, Recall@K, MRR, NDCG, Hit Rate@K, and P95/P99 latency metrics across test queries.',
            body: BenchmarkRequestSchema,
            response: {
                200: BenchmarkResponseSchema,
                400: standardErrorResponses[400],
                500: standardErrorResponses[500],
            },
        },
        handler: (req, reply) => {
            if (benchmarkController) {
                return benchmarkController.benchmark(req, reply);
            }
            return controller.benchmark(req, reply);
        },
    });
    // POST /api/search/prior-art - Prior art search helper endpoint
    fastify.post('/prior-art', {
        schema: {
            tags: ['Search'],
            summary: 'Prior-Art Search Candidates',
            description: 'Internal prior-art candidate retrieval endpoint for downstream RAG and report generators.',
            body: SearchRequestSchema,
            response: {
                200: SearchResponseSchema,
                400: standardErrorResponses[400],
                500: standardErrorResponses[500],
            },
        },
        handler: (req, reply) => controller.searchPriorArt(req, reply),
    });
    // POST /api/search/novelty-matrix - Element-Level Novelty Overlap Matrix
    fastify.post('/novelty-matrix', {
        schema: {
            tags: ['Search'],
            summary: 'Element-Level Novelty Overlap Matrix',
            description: 'Generates feature-by-feature claim comparison matrix across top prior-art patents, calculating element overlap status (EXACT_MATCH, PARTIAL_MATCH, NO_MATCH), citation evidence, and overall Novelty Risk Score.',
            response: {
                400: standardErrorResponses[400],
                500: standardErrorResponses[500],
            },
        },
        handler: (req, reply) => controller.getNoveltyMatrix(req, reply),
    });
}
//# sourceMappingURL=search.routes.js.map