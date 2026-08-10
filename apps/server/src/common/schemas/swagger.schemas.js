/**
 * Centralized reusable OpenAPI 3.1 JSON Schemas for Fastify & Swagger UI.
 */
// --- HTTP Error Response Schemas ---
export const ErrorResponseSchema = {
    type: 'object',
    properties: {
        statusCode: { type: 'integer', example: 400 },
        error: { type: 'string', example: 'Bad Request' },
        message: { type: 'string', example: 'Invalid request parameters' },
        timestamp: { type: 'string', format: 'date-time', example: '2026-08-01T12:00:00.000Z' },
    },
    required: ['statusCode', 'error', 'message'],
};
export const Error400Schema = {
    ...ErrorResponseSchema,
    description: 'Bad Request - Validation or parameter error',
    example: {
        statusCode: 400,
        error: 'Bad Request',
        message: 'query cannot be empty',
        timestamp: '2026-08-01T12:00:00.000Z',
    },
};
export const Error401Schema = {
    ...ErrorResponseSchema,
    description: 'Unauthorized - Missing or invalid Bearer JWT token',
    example: {
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication token required',
        timestamp: '2026-08-01T12:00:00.000Z',
    },
};
export const Error403Schema = {
    ...ErrorResponseSchema,
    description: 'Forbidden - Insufficient permissions',
    example: {
        statusCode: 403,
        error: 'Forbidden',
        message: 'Access denied for resource',
        timestamp: '2026-08-01T12:00:00.000Z',
    },
};
export const Error404Schema = {
    ...ErrorResponseSchema,
    description: 'Not Found - Resource or entity not found',
    example: {
        statusCode: 404,
        error: 'Not Found',
        message: 'Search history record not found',
        timestamp: '2026-08-01T12:00:00.000Z',
    },
};
export const Error409Schema = {
    ...ErrorResponseSchema,
    description: 'Conflict - Duplicate entity or state conflict',
    example: {
        statusCode: 409,
        error: 'Conflict',
        message: 'User email already exists',
        timestamp: '2026-08-01T12:00:00.000Z',
    },
};
export const Error422Schema = {
    ...ErrorResponseSchema,
    description: 'Unprocessable Entity - Valid syntax but invalid semantic payload',
    example: {
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: 'Unsupported document file type',
        timestamp: '2026-08-01T12:00:00.000Z',
    },
};
export const Error429Schema = {
    ...ErrorResponseSchema,
    description: 'Too Many Requests - Rate limit exceeded',
    example: {
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded, try again in 60s',
        timestamp: '2026-08-01T12:00:00.000Z',
    },
};
export const Error500Schema = {
    ...ErrorResponseSchema,
    description: 'Internal Server Error - Unexpected server or external service failure',
    example: {
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Vector store communication failed',
        timestamp: '2026-08-01T12:00:00.000Z',
    },
};
export const Error503Schema = {
    ...ErrorResponseSchema,
    description: 'Service Unavailable - External service or LLM provider is unreachable',
    example: {
        statusCode: 503,
        error: 'Service Unavailable',
        message: 'Ollama embedding service is currently unreachable',
        timestamp: '2026-08-01T12:00:00.000Z',
    },
};
// Standard HTTP error responses map for reuse across endpoints
export const standardErrorResponses = {
    400: Error400Schema,
    401: Error401Schema,
    403: Error403Schema,
    404: Error404Schema,
    409: Error409Schema,
    422: Error422Schema,
    429: Error429Schema,
    500: Error500Schema,
    503: Error503Schema,
};
// --- Model Schemas ---
export const SearchFilterSchema = {
    type: 'object',
    properties: {
        ipc: { type: 'string', description: 'International Patent Classification code', example: 'B64C 39/02' },
        country: { type: 'string', description: 'Country code (e.g. US, EP, WO)', example: 'US' },
        publicationDate: { type: 'string', format: 'date', example: '2023-05-12' },
        publicationDateFrom: { type: 'string', format: 'date', example: '2020-01-01' },
        publicationDateTo: { type: 'string', format: 'date', example: '2023-12-31' },
        owner: { type: 'string', description: 'Patent owner / assignee name', example: 'AeroTech Systems Inc.' },
        section: { type: 'string', enum: ['title', 'abstract', 'claims'], example: 'abstract' },
    },
};
export const SearchRequestSchema = {
    type: 'object',
    required: ['query'],
    properties: {
        query: { type: 'string', description: 'Invention description or patent search query', example: 'Wireless charging system for electric vehicles with resonant inductive coupling' },
        topK: { type: 'integer', minimum: 1, maximum: 100, default: 10, description: 'Number of top similar patents to retrieve', example: 10 },
        filters: SearchFilterSchema,
    },
};
export const PatentResultSchema = {
    type: 'object',
    properties: {
        rank: { type: 'integer', example: 1 },
        score: { type: 'number', description: 'Cosine similarity score (0.0 to 1.0)', example: 0.9124 },
        patentId: { type: 'string', example: 'US-9876543-B2' },
        title: { type: 'string', example: 'Inductive wireless power transfer system for electric vehicles' },
        abstract: { type: 'string', example: 'A system for wireless charging featuring adaptive frequency tuning...' },
        claims: { type: 'string', example: '1. A wireless power transfer system comprising...' },
        ipc: { type: 'string', example: 'H02J 50/12' },
        country: { type: 'string', example: 'US' },
        owner: { type: 'string', example: 'PowerTech Global LLC' },
        publicationDate: { type: 'string', example: '2023-04-15' },
        section: { type: 'string', example: 'abstract' },
    },
};
export const SearchResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        query: { type: 'string', example: 'Wireless charging system for electric vehicles' },
        count: { type: 'integer', example: 5 },
        searchHistoryId: { type: 'string', format: 'uuid', example: 'a540aa40-a25c-427c-8848-dea943861a3a' },
        filters: SearchFilterSchema,
        results: { type: 'array', items: PatentResultSchema },
        metrics: {
            type: 'object',
            properties: {
                queryEmbeddingTimeMs: { type: 'integer', example: 45 },
                pineconeSearchTimeMs: { type: 'integer', example: 110 },
                totalExecutionTimeMs: { type: 'integer', example: 155 },
                totalResults: { type: 'integer', example: 5 },
            },
        },
    },
};
export const NoveltyAnalysisSchema = {
    type: 'object',
    properties: {
        summary: { type: 'string', example: 'The proposed invention introduces a multi-coil alignment algorithm.' },
        similarPatents: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    patentId: { type: 'string', example: 'US-9876543-B2' },
                    reason: { type: 'string', example: 'Overlaps on inductive resonant coil geometry' },
                },
            },
        },
        featureComparison: {
            type: 'object',
            properties: {
                commonFeatures: { type: 'array', items: { type: 'string' }, example: ['Inductive power transfer'] },
                uniqueFeatures: { type: 'array', items: { type: 'string' }, example: ['Dual-frequency phase lock loop'] },
                partialOverlap: { type: 'array', items: { type: 'string' }, example: ['Thermal sensor placement'] },
            },
        },
        novelAspects: { type: 'array', items: { type: 'string' }, example: ['Dynamic impedance matching under high misalignment'] },
        overlappingClaims: { type: 'array', items: { type: 'string' }, example: ['Claim 1: Inductive coil alignment'] },
        risks: { type: 'array', items: { type: 'string' }, example: ['High risk of prior art challenge under US-9876543-B2'] },
        recommendations: { type: 'array', items: { type: 'string' }, example: ['Refine claim 1 to specify phase-lock switching'] },
    },
};
export const RagAnalysisResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        query: { type: 'string', example: 'Wireless charging system for electric vehicles' },
        retrievedPatents: { type: 'array', items: PatentResultSchema },
        analysis: NoveltyAnalysisSchema,
        overlapAnalysis: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    patentId: { type: 'string', example: 'US-9876543-B2' },
                    title: { type: 'string', example: 'Inductive wireless power transfer' },
                    similarityScore: { type: 'number', example: 0.91 },
                    overlappingClaims: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                claimNumber: { type: 'integer', example: 1 },
                                summary: { type: 'string', example: 'Coil geometry match' },
                                overlapStrength: { type: 'string', enum: ['High', 'Medium', 'Low'], example: 'High' },
                            },
                        },
                    },
                },
            },
        },
        metrics: {
            type: 'object',
            properties: {
                retrievalTimeMs: { type: 'integer', example: 120 },
                promptTimeMs: { type: 'integer', example: 15 },
                llmInferenceTimeMs: { type: 'integer', example: 1850 },
                totalTimeMs: { type: 'integer', example: 1985 },
                retrievedCount: { type: 'integer', example: 10 },
            },
        },
    },
};
export const UploadResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        file: {
            type: 'object',
            properties: {
                filename: { type: 'string', example: 'patent_application_draft.pdf' },
                originalName: { type: 'string', example: 'patent_application_draft.pdf' },
                mimeType: { type: 'string', example: 'application/pdf' },
                sizeBytes: { type: 'integer', example: 245120 },
                storagePath: { type: 'string', example: '/uploads/patents/patent_application_draft.pdf' },
            },
        },
        parsedData: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Autonomous UAV Obstacle Avoidance System' },
                abstract: { type: 'string', example: 'A multi-sensor navigation framework for drones...' },
                extractedSectionsCount: { type: 'integer', example: 4 },
            },
        },
        message: { type: 'string', example: 'Patent document uploaded and parsed successfully' },
    },
};
export const HistoryRecordSchema = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid', example: 'a540aa40-a25c-427c-8848-dea943861a3a' },
        userId: { type: 'string', nullable: true, example: 'usr-12345' },
        searchQuery: { type: 'string', example: 'Wireless charging system for electric vehicles' },
        topK: { type: 'integer', example: 10 },
        appliedFilters: SearchFilterSchema,
        totalResults: { type: 'integer', example: 5 },
        searchLatency: { type: 'integer', example: 155 },
        createdAt: { type: 'string', format: 'date-time', example: '2026-08-01T10:30:00.000Z' },
        retrievedPatents: { type: 'array', items: PatentResultSchema },
        noveltyAnalysis: NoveltyAnalysisSchema,
    },
};
export const HistoryListResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: HistoryRecordSchema },
        meta: {
            type: 'object',
            properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                totalItems: { type: 'integer', example: 42 },
                totalPages: { type: 'integer', example: 5 },
            },
        },
    },
};
export const AuthRegisterRequestSchema = {
    type: 'object',
    required: ['email', 'password', 'name'],
    properties: {
        email: { type: 'string', format: 'email', example: 'developer@patentiq.ai' },
        password: { type: 'string', minLength: 8, example: 'SecurePassword123!' },
        name: { type: 'string', example: 'Dr. Jane Doe' },
    },
};
export const AuthLoginRequestSchema = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: { type: 'string', format: 'email', example: 'developer@patentiq.ai' },
        password: { type: 'string', example: 'SecurePassword123!' },
    },
};
export const AuthTokenResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'def456-refresh-token-string' },
        tokenType: { type: 'string', example: 'Bearer' },
        expiresIn: { type: 'integer', example: 86400 },
        user: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'usr-9876' },
                email: { type: 'string', example: 'developer@patentiq.ai' },
                name: { type: 'string', example: 'Dr. Jane Doe' },
            },
        },
    },
};
export const BenchmarkRequestSchema = {
    type: 'object',
    properties: {
        topK: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 10 },
        iterations: { type: 'integer', minimum: 1, maximum: 50, default: 5, example: 5 },
        testQueries: {
            type: 'array',
            items: { type: 'string' },
            example: ['Autonomous vehicle LiDAR obstacle detection', 'Inductive wireless power transfer'],
        },
    },
};
export const BenchmarkResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        retrievalAccuracy: {
            type: 'object',
            properties: {
                precisionAtK: { type: 'number', example: 0.85 },
                recallAtK: { type: 'number', example: 0.78 },
                mrr: { type: 'number', example: 0.92 },
                ndcg: { type: 'number', example: 0.88 },
                hitRateAtK: { type: 'number', example: 0.95 },
            },
        },
        performanceMetrics: {
            type: 'object',
            properties: {
                meanLatencyMs: { type: 'number', example: 145.2 },
                p95LatencyMs: { type: 'number', example: 210.0 },
                p99LatencyMs: { type: 'number', example: 295.5 },
                throughputQueriesPerSec: { type: 'number', example: 28.4 },
            },
        },
    },
};
export const HealthStatusSchema = {
    type: 'object',
    properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'PatentIQ API' },
        timestamp: { type: 'string', format: 'date-time', example: '2026-08-01T12:00:00.000Z' },
        details: {
            type: 'object',
            properties: {
                database: { type: 'string', example: 'connected' },
                pinecone: { type: 'string', example: 'connected' },
                ollama: { type: 'string', example: 'connected' },
            },
        },
    },
};
export const DocumentUploadSuccessSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        document: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid', example: 'e83b9c7d-3a4b-4c5d-8e9f-0123456789ab' },
                originalFileName: { type: 'string', example: 'Patent_Application_Draft.pdf' },
                storedFileName: { type: 'string', example: 'e83b9c7d-3a4b-4c5d-8e9f-0123456789ab.pdf' },
                mimeType: { type: 'string', example: 'application/pdf' },
                size: { type: 'integer', example: 102345 },
                status: { type: 'string', enum: ['Uploaded', 'Processing', 'Completed', 'Failed'], example: 'Uploaded' },
                uploadedAt: { type: 'string', format: 'date-time', example: '2026-08-01T18:00:00.000Z' },
            },
        },
    },
};
export const DocumentDeleteSuccessSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Document deleted successfully' },
    },
};
export const StandardPatentDocumentSchema = {
    type: 'object',
    required: ['title', 'abstract', 'claims', 'keywords', 'fullText'],
    properties: {
        title: { type: 'string', description: 'Normalized patent or invention title', example: 'Wireless Charging Drone' },
        abstract: { type: 'string', description: 'Normalized patent abstract', example: 'An autonomous drone configured for resonant inductive wireless power transfer during flight.' },
        claims: { type: 'string', description: 'Normalized claims or novel features', example: '1. An autonomous aerial vehicle comprising an inductive receiver coil...' },
        keywords: {
            type: 'array',
            items: { type: 'string' },
            description: 'Extracted normalized keywords',
            example: ['wireless', 'charging', 'drone', 'inductive power'],
        },
        fullText: { type: 'string', description: 'Unified complete normalized document text', example: 'Title: Wireless Charging Drone\n\nAbstract:\nAn autonomous drone...' },
    },
};
export const ProcessDirectTextPayloadSchema = {
    type: 'object',
    required: ['title', 'abstract', 'claims'],
    properties: {
        title: { type: 'string', description: 'Patent title', example: 'Wireless Charging Drone' },
        abstract: { type: 'string', description: 'Patent abstract / overview', example: 'An autonomous drone configured for resonant inductive wireless power transfer during flight.' },
        claims: { type: 'string', description: 'Patent claims or novel features', example: '1. An autonomous aerial vehicle comprising an inductive receiver coil...' },
        keywords: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional array of keywords',
            example: ['wireless', 'charging'],
        },
    },
};
export const ProcessDocumentSuccessSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        data: StandardPatentDocumentSchema,
    },
};
export const EmbedDocumentRequestSchema = {
    type: 'object',
    properties: {
        documentId: { type: 'string', format: 'uuid', description: 'ID of previously uploaded document', example: 'e83b9c7d-3a4b-4c5d-8e9f-0123456789ab' },
        document: StandardPatentDocumentSchema,
    },
};
export const EmbedDocumentSuccessSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        embedding: {
            type: 'object',
            properties: {
                model: { type: 'string', example: 'nomic-embed-text' },
                dimensions: { type: 'integer', example: 768 },
                sections: { type: 'array', items: { type: 'string' }, example: ['title', 'abstract', 'claims'] },
                generatedAt: { type: 'string', format: 'date-time', example: '2026-08-02T09:09:22.000Z' },
            },
        },
    },
};
export const CompareDocumentRequestSchema = {
    type: 'object',
    properties: {
        documentId: { type: 'string', format: 'uuid', description: 'ID of previously uploaded document', example: 'e83b9c7d-3a4b-4c5d-8e9f-0123456789ab' },
        document: StandardPatentDocumentSchema,
        topK: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 10 },
    },
};
export const CompareDocumentSuccessSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        document: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid', example: 'e83b9c7d-3a4b-4c5d-8e9f-0123456789ab' },
                title: { type: 'string', example: 'Wireless Charging Drone' },
            },
        },
        retrieval: {
            type: 'object',
            properties: {
                topK: { type: 'integer', example: 10 },
                retrievalConfidence: { type: 'number', example: 91.6 },
            },
        },
        matches: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    rank: { type: 'integer', example: 1 },
                    patentId: { type: 'string', example: 'US10123456B2' },
                    title: { type: 'string', example: 'Wireless Power Transfer System' },
                    similarityScore: { type: 'number', example: 0.92 },
                    ipc: { type: 'string', example: 'H02J 50/10' },
                    country: { type: 'string', example: 'US' },
                    publicationDate: { type: 'string', example: '2023-01-15' },
                    matchingSections: { type: 'array', items: { type: 'string' }, example: ['Abstract', 'Claims'] },
                },
            },
        },
        analysis: {
            type: 'object',
            properties: {
                summary: { type: 'string', example: 'The uploaded invention shows high similarity to prior-art patent US10123456B2.' },
                novelty: { type: 'string', example: 'Dual-frequency resonant coils integrated directly into rotor arms.' },
                overlappingClaims: { type: 'array', items: { type: 'string' }, example: ['Claim 1 overlaps with US10123456B2 Claim 4'] },
                recommendations: { type: 'array', items: { type: 'string' }, example: ['Differentiate rotor arm structure in dependent claims.'] },
            },
        },
        searchHistoryId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' },
    },
};
//# sourceMappingURL=swagger.schemas.js.map