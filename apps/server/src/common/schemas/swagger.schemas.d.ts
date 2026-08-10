/**
 * Centralized reusable OpenAPI 3.1 JSON Schemas for Fastify & Swagger UI.
 */
export declare const ErrorResponseSchema: {
    type: string;
    properties: {
        statusCode: {
            type: string;
            example: number;
        };
        error: {
            type: string;
            example: string;
        };
        message: {
            type: string;
            example: string;
        };
        timestamp: {
            type: string;
            format: string;
            example: string;
        };
    };
    required: string[];
};
export declare const Error400Schema: {
    type: string;
    properties: {
        statusCode: {
            type: string;
            example: number;
        };
        error: {
            type: string;
            example: string;
        };
        message: {
            type: string;
            example: string;
        };
        timestamp: {
            type: string;
            format: string;
            example: string;
        };
    };
    required: string[];
    description: string;
    example: {
        statusCode: number;
        error: string;
        message: string;
        timestamp: string;
    };
};
export declare const Error401Schema: {
    type: string;
    properties: {
        statusCode: {
            type: string;
            example: number;
        };
        error: {
            type: string;
            example: string;
        };
        message: {
            type: string;
            example: string;
        };
        timestamp: {
            type: string;
            format: string;
            example: string;
        };
    };
    required: string[];
    description: string;
    example: {
        statusCode: number;
        error: string;
        message: string;
        timestamp: string;
    };
};
export declare const Error403Schema: {
    type: string;
    properties: {
        statusCode: {
            type: string;
            example: number;
        };
        error: {
            type: string;
            example: string;
        };
        message: {
            type: string;
            example: string;
        };
        timestamp: {
            type: string;
            format: string;
            example: string;
        };
    };
    required: string[];
    description: string;
    example: {
        statusCode: number;
        error: string;
        message: string;
        timestamp: string;
    };
};
export declare const Error404Schema: {
    type: string;
    properties: {
        statusCode: {
            type: string;
            example: number;
        };
        error: {
            type: string;
            example: string;
        };
        message: {
            type: string;
            example: string;
        };
        timestamp: {
            type: string;
            format: string;
            example: string;
        };
    };
    required: string[];
    description: string;
    example: {
        statusCode: number;
        error: string;
        message: string;
        timestamp: string;
    };
};
export declare const Error409Schema: {
    type: string;
    properties: {
        statusCode: {
            type: string;
            example: number;
        };
        error: {
            type: string;
            example: string;
        };
        message: {
            type: string;
            example: string;
        };
        timestamp: {
            type: string;
            format: string;
            example: string;
        };
    };
    required: string[];
    description: string;
    example: {
        statusCode: number;
        error: string;
        message: string;
        timestamp: string;
    };
};
export declare const Error422Schema: {
    type: string;
    properties: {
        statusCode: {
            type: string;
            example: number;
        };
        error: {
            type: string;
            example: string;
        };
        message: {
            type: string;
            example: string;
        };
        timestamp: {
            type: string;
            format: string;
            example: string;
        };
    };
    required: string[];
    description: string;
    example: {
        statusCode: number;
        error: string;
        message: string;
        timestamp: string;
    };
};
export declare const Error429Schema: {
    type: string;
    properties: {
        statusCode: {
            type: string;
            example: number;
        };
        error: {
            type: string;
            example: string;
        };
        message: {
            type: string;
            example: string;
        };
        timestamp: {
            type: string;
            format: string;
            example: string;
        };
    };
    required: string[];
    description: string;
    example: {
        statusCode: number;
        error: string;
        message: string;
        timestamp: string;
    };
};
export declare const Error500Schema: {
    type: string;
    properties: {
        statusCode: {
            type: string;
            example: number;
        };
        error: {
            type: string;
            example: string;
        };
        message: {
            type: string;
            example: string;
        };
        timestamp: {
            type: string;
            format: string;
            example: string;
        };
    };
    required: string[];
    description: string;
    example: {
        statusCode: number;
        error: string;
        message: string;
        timestamp: string;
    };
};
export declare const Error503Schema: {
    type: string;
    properties: {
        statusCode: {
            type: string;
            example: number;
        };
        error: {
            type: string;
            example: string;
        };
        message: {
            type: string;
            example: string;
        };
        timestamp: {
            type: string;
            format: string;
            example: string;
        };
    };
    required: string[];
    description: string;
    example: {
        statusCode: number;
        error: string;
        message: string;
        timestamp: string;
    };
};
export declare const standardErrorResponses: {
    400: {
        type: string;
        properties: {
            statusCode: {
                type: string;
                example: number;
            };
            error: {
                type: string;
                example: string;
            };
            message: {
                type: string;
                example: string;
            };
            timestamp: {
                type: string;
                format: string;
                example: string;
            };
        };
        required: string[];
        description: string;
        example: {
            statusCode: number;
            error: string;
            message: string;
            timestamp: string;
        };
    };
    401: {
        type: string;
        properties: {
            statusCode: {
                type: string;
                example: number;
            };
            error: {
                type: string;
                example: string;
            };
            message: {
                type: string;
                example: string;
            };
            timestamp: {
                type: string;
                format: string;
                example: string;
            };
        };
        required: string[];
        description: string;
        example: {
            statusCode: number;
            error: string;
            message: string;
            timestamp: string;
        };
    };
    403: {
        type: string;
        properties: {
            statusCode: {
                type: string;
                example: number;
            };
            error: {
                type: string;
                example: string;
            };
            message: {
                type: string;
                example: string;
            };
            timestamp: {
                type: string;
                format: string;
                example: string;
            };
        };
        required: string[];
        description: string;
        example: {
            statusCode: number;
            error: string;
            message: string;
            timestamp: string;
        };
    };
    404: {
        type: string;
        properties: {
            statusCode: {
                type: string;
                example: number;
            };
            error: {
                type: string;
                example: string;
            };
            message: {
                type: string;
                example: string;
            };
            timestamp: {
                type: string;
                format: string;
                example: string;
            };
        };
        required: string[];
        description: string;
        example: {
            statusCode: number;
            error: string;
            message: string;
            timestamp: string;
        };
    };
    409: {
        type: string;
        properties: {
            statusCode: {
                type: string;
                example: number;
            };
            error: {
                type: string;
                example: string;
            };
            message: {
                type: string;
                example: string;
            };
            timestamp: {
                type: string;
                format: string;
                example: string;
            };
        };
        required: string[];
        description: string;
        example: {
            statusCode: number;
            error: string;
            message: string;
            timestamp: string;
        };
    };
    422: {
        type: string;
        properties: {
            statusCode: {
                type: string;
                example: number;
            };
            error: {
                type: string;
                example: string;
            };
            message: {
                type: string;
                example: string;
            };
            timestamp: {
                type: string;
                format: string;
                example: string;
            };
        };
        required: string[];
        description: string;
        example: {
            statusCode: number;
            error: string;
            message: string;
            timestamp: string;
        };
    };
    429: {
        type: string;
        properties: {
            statusCode: {
                type: string;
                example: number;
            };
            error: {
                type: string;
                example: string;
            };
            message: {
                type: string;
                example: string;
            };
            timestamp: {
                type: string;
                format: string;
                example: string;
            };
        };
        required: string[];
        description: string;
        example: {
            statusCode: number;
            error: string;
            message: string;
            timestamp: string;
        };
    };
    500: {
        type: string;
        properties: {
            statusCode: {
                type: string;
                example: number;
            };
            error: {
                type: string;
                example: string;
            };
            message: {
                type: string;
                example: string;
            };
            timestamp: {
                type: string;
                format: string;
                example: string;
            };
        };
        required: string[];
        description: string;
        example: {
            statusCode: number;
            error: string;
            message: string;
            timestamp: string;
        };
    };
    503: {
        type: string;
        properties: {
            statusCode: {
                type: string;
                example: number;
            };
            error: {
                type: string;
                example: string;
            };
            message: {
                type: string;
                example: string;
            };
            timestamp: {
                type: string;
                format: string;
                example: string;
            };
        };
        required: string[];
        description: string;
        example: {
            statusCode: number;
            error: string;
            message: string;
            timestamp: string;
        };
    };
};
export declare const SearchFilterSchema: {
    type: string;
    properties: {
        ipc: {
            type: string;
            description: string;
            example: string;
        };
        country: {
            type: string;
            description: string;
            example: string;
        };
        publicationDate: {
            type: string;
            format: string;
            example: string;
        };
        publicationDateFrom: {
            type: string;
            format: string;
            example: string;
        };
        publicationDateTo: {
            type: string;
            format: string;
            example: string;
        };
        owner: {
            type: string;
            description: string;
            example: string;
        };
        section: {
            type: string;
            enum: string[];
            example: string;
        };
    };
};
export declare const SearchRequestSchema: {
    type: string;
    required: string[];
    properties: {
        query: {
            type: string;
            description: string;
            example: string;
        };
        topK: {
            type: string;
            minimum: number;
            maximum: number;
            default: number;
            description: string;
            example: number;
        };
        filters: {
            type: string;
            properties: {
                ipc: {
                    type: string;
                    description: string;
                    example: string;
                };
                country: {
                    type: string;
                    description: string;
                    example: string;
                };
                publicationDate: {
                    type: string;
                    format: string;
                    example: string;
                };
                publicationDateFrom: {
                    type: string;
                    format: string;
                    example: string;
                };
                publicationDateTo: {
                    type: string;
                    format: string;
                    example: string;
                };
                owner: {
                    type: string;
                    description: string;
                    example: string;
                };
                section: {
                    type: string;
                    enum: string[];
                    example: string;
                };
            };
        };
    };
};
export declare const PatentResultSchema: {
    type: string;
    properties: {
        rank: {
            type: string;
            example: number;
        };
        score: {
            type: string;
            description: string;
            example: number;
        };
        patentId: {
            type: string;
            example: string;
        };
        title: {
            type: string;
            example: string;
        };
        abstract: {
            type: string;
            example: string;
        };
        claims: {
            type: string;
            example: string;
        };
        ipc: {
            type: string;
            example: string;
        };
        country: {
            type: string;
            example: string;
        };
        owner: {
            type: string;
            example: string;
        };
        publicationDate: {
            type: string;
            example: string;
        };
        section: {
            type: string;
            example: string;
        };
    };
};
export declare const SearchResponseSchema: {
    type: string;
    properties: {
        success: {
            type: string;
            example: boolean;
        };
        query: {
            type: string;
            example: string;
        };
        count: {
            type: string;
            example: number;
        };
        searchHistoryId: {
            type: string;
            format: string;
            example: string;
        };
        filters: {
            type: string;
            properties: {
                ipc: {
                    type: string;
                    description: string;
                    example: string;
                };
                country: {
                    type: string;
                    description: string;
                    example: string;
                };
                publicationDate: {
                    type: string;
                    format: string;
                    example: string;
                };
                publicationDateFrom: {
                    type: string;
                    format: string;
                    example: string;
                };
                publicationDateTo: {
                    type: string;
                    format: string;
                    example: string;
                };
                owner: {
                    type: string;
                    description: string;
                    example: string;
                };
                section: {
                    type: string;
                    enum: string[];
                    example: string;
                };
            };
        };
        results: {
            type: string;
            items: {
                type: string;
                properties: {
                    rank: {
                        type: string;
                        example: number;
                    };
                    score: {
                        type: string;
                        description: string;
                        example: number;
                    };
                    patentId: {
                        type: string;
                        example: string;
                    };
                    title: {
                        type: string;
                        example: string;
                    };
                    abstract: {
                        type: string;
                        example: string;
                    };
                    claims: {
                        type: string;
                        example: string;
                    };
                    ipc: {
                        type: string;
                        example: string;
                    };
                    country: {
                        type: string;
                        example: string;
                    };
                    owner: {
                        type: string;
                        example: string;
                    };
                    publicationDate: {
                        type: string;
                        example: string;
                    };
                    section: {
                        type: string;
                        example: string;
                    };
                };
            };
        };
        metrics: {
            type: string;
            properties: {
                queryEmbeddingTimeMs: {
                    type: string;
                    example: number;
                };
                pineconeSearchTimeMs: {
                    type: string;
                    example: number;
                };
                totalExecutionTimeMs: {
                    type: string;
                    example: number;
                };
                totalResults: {
                    type: string;
                    example: number;
                };
            };
        };
    };
};
export declare const NoveltyAnalysisSchema: {
    type: string;
    properties: {
        summary: {
            type: string;
            example: string;
        };
        similarPatents: {
            type: string;
            items: {
                type: string;
                properties: {
                    patentId: {
                        type: string;
                        example: string;
                    };
                    reason: {
                        type: string;
                        example: string;
                    };
                };
            };
        };
        featureComparison: {
            type: string;
            properties: {
                commonFeatures: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
                uniqueFeatures: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
                partialOverlap: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
            };
        };
        novelAspects: {
            type: string;
            items: {
                type: string;
            };
            example: string[];
        };
        overlappingClaims: {
            type: string;
            items: {
                type: string;
            };
            example: string[];
        };
        risks: {
            type: string;
            items: {
                type: string;
            };
            example: string[];
        };
        recommendations: {
            type: string;
            items: {
                type: string;
            };
            example: string[];
        };
    };
};
export declare const RagAnalysisResponseSchema: {
    type: string;
    properties: {
        success: {
            type: string;
            example: boolean;
        };
        query: {
            type: string;
            example: string;
        };
        retrievedPatents: {
            type: string;
            items: {
                type: string;
                properties: {
                    rank: {
                        type: string;
                        example: number;
                    };
                    score: {
                        type: string;
                        description: string;
                        example: number;
                    };
                    patentId: {
                        type: string;
                        example: string;
                    };
                    title: {
                        type: string;
                        example: string;
                    };
                    abstract: {
                        type: string;
                        example: string;
                    };
                    claims: {
                        type: string;
                        example: string;
                    };
                    ipc: {
                        type: string;
                        example: string;
                    };
                    country: {
                        type: string;
                        example: string;
                    };
                    owner: {
                        type: string;
                        example: string;
                    };
                    publicationDate: {
                        type: string;
                        example: string;
                    };
                    section: {
                        type: string;
                        example: string;
                    };
                };
            };
        };
        analysis: {
            type: string;
            properties: {
                summary: {
                    type: string;
                    example: string;
                };
                similarPatents: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            patentId: {
                                type: string;
                                example: string;
                            };
                            reason: {
                                type: string;
                                example: string;
                            };
                        };
                    };
                };
                featureComparison: {
                    type: string;
                    properties: {
                        commonFeatures: {
                            type: string;
                            items: {
                                type: string;
                            };
                            example: string[];
                        };
                        uniqueFeatures: {
                            type: string;
                            items: {
                                type: string;
                            };
                            example: string[];
                        };
                        partialOverlap: {
                            type: string;
                            items: {
                                type: string;
                            };
                            example: string[];
                        };
                    };
                };
                novelAspects: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
                overlappingClaims: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
                risks: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
                recommendations: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
            };
        };
        overlapAnalysis: {
            type: string;
            items: {
                type: string;
                properties: {
                    patentId: {
                        type: string;
                        example: string;
                    };
                    title: {
                        type: string;
                        example: string;
                    };
                    similarityScore: {
                        type: string;
                        example: number;
                    };
                    overlappingClaims: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                claimNumber: {
                                    type: string;
                                    example: number;
                                };
                                summary: {
                                    type: string;
                                    example: string;
                                };
                                overlapStrength: {
                                    type: string;
                                    enum: string[];
                                    example: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        metrics: {
            type: string;
            properties: {
                retrievalTimeMs: {
                    type: string;
                    example: number;
                };
                promptTimeMs: {
                    type: string;
                    example: number;
                };
                llmInferenceTimeMs: {
                    type: string;
                    example: number;
                };
                totalTimeMs: {
                    type: string;
                    example: number;
                };
                retrievedCount: {
                    type: string;
                    example: number;
                };
            };
        };
    };
};
export declare const UploadResponseSchema: {
    type: string;
    properties: {
        success: {
            type: string;
            example: boolean;
        };
        file: {
            type: string;
            properties: {
                filename: {
                    type: string;
                    example: string;
                };
                originalName: {
                    type: string;
                    example: string;
                };
                mimeType: {
                    type: string;
                    example: string;
                };
                sizeBytes: {
                    type: string;
                    example: number;
                };
                storagePath: {
                    type: string;
                    example: string;
                };
            };
        };
        parsedData: {
            type: string;
            properties: {
                title: {
                    type: string;
                    example: string;
                };
                abstract: {
                    type: string;
                    example: string;
                };
                extractedSectionsCount: {
                    type: string;
                    example: number;
                };
            };
        };
        message: {
            type: string;
            example: string;
        };
    };
};
export declare const HistoryRecordSchema: {
    type: string;
    properties: {
        id: {
            type: string;
            format: string;
            example: string;
        };
        userId: {
            type: string;
            nullable: boolean;
            example: string;
        };
        searchQuery: {
            type: string;
            example: string;
        };
        topK: {
            type: string;
            example: number;
        };
        appliedFilters: {
            type: string;
            properties: {
                ipc: {
                    type: string;
                    description: string;
                    example: string;
                };
                country: {
                    type: string;
                    description: string;
                    example: string;
                };
                publicationDate: {
                    type: string;
                    format: string;
                    example: string;
                };
                publicationDateFrom: {
                    type: string;
                    format: string;
                    example: string;
                };
                publicationDateTo: {
                    type: string;
                    format: string;
                    example: string;
                };
                owner: {
                    type: string;
                    description: string;
                    example: string;
                };
                section: {
                    type: string;
                    enum: string[];
                    example: string;
                };
            };
        };
        totalResults: {
            type: string;
            example: number;
        };
        searchLatency: {
            type: string;
            example: number;
        };
        createdAt: {
            type: string;
            format: string;
            example: string;
        };
        retrievedPatents: {
            type: string;
            items: {
                type: string;
                properties: {
                    rank: {
                        type: string;
                        example: number;
                    };
                    score: {
                        type: string;
                        description: string;
                        example: number;
                    };
                    patentId: {
                        type: string;
                        example: string;
                    };
                    title: {
                        type: string;
                        example: string;
                    };
                    abstract: {
                        type: string;
                        example: string;
                    };
                    claims: {
                        type: string;
                        example: string;
                    };
                    ipc: {
                        type: string;
                        example: string;
                    };
                    country: {
                        type: string;
                        example: string;
                    };
                    owner: {
                        type: string;
                        example: string;
                    };
                    publicationDate: {
                        type: string;
                        example: string;
                    };
                    section: {
                        type: string;
                        example: string;
                    };
                };
            };
        };
        noveltyAnalysis: {
            type: string;
            properties: {
                summary: {
                    type: string;
                    example: string;
                };
                similarPatents: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            patentId: {
                                type: string;
                                example: string;
                            };
                            reason: {
                                type: string;
                                example: string;
                            };
                        };
                    };
                };
                featureComparison: {
                    type: string;
                    properties: {
                        commonFeatures: {
                            type: string;
                            items: {
                                type: string;
                            };
                            example: string[];
                        };
                        uniqueFeatures: {
                            type: string;
                            items: {
                                type: string;
                            };
                            example: string[];
                        };
                        partialOverlap: {
                            type: string;
                            items: {
                                type: string;
                            };
                            example: string[];
                        };
                    };
                };
                novelAspects: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
                overlappingClaims: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
                risks: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
                recommendations: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
            };
        };
    };
};
export declare const HistoryListResponseSchema: {
    type: string;
    properties: {
        success: {
            type: string;
            example: boolean;
        };
        data: {
            type: string;
            items: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                        example: string;
                    };
                    userId: {
                        type: string;
                        nullable: boolean;
                        example: string;
                    };
                    searchQuery: {
                        type: string;
                        example: string;
                    };
                    topK: {
                        type: string;
                        example: number;
                    };
                    appliedFilters: {
                        type: string;
                        properties: {
                            ipc: {
                                type: string;
                                description: string;
                                example: string;
                            };
                            country: {
                                type: string;
                                description: string;
                                example: string;
                            };
                            publicationDate: {
                                type: string;
                                format: string;
                                example: string;
                            };
                            publicationDateFrom: {
                                type: string;
                                format: string;
                                example: string;
                            };
                            publicationDateTo: {
                                type: string;
                                format: string;
                                example: string;
                            };
                            owner: {
                                type: string;
                                description: string;
                                example: string;
                            };
                            section: {
                                type: string;
                                enum: string[];
                                example: string;
                            };
                        };
                    };
                    totalResults: {
                        type: string;
                        example: number;
                    };
                    searchLatency: {
                        type: string;
                        example: number;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                        example: string;
                    };
                    retrievedPatents: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                rank: {
                                    type: string;
                                    example: number;
                                };
                                score: {
                                    type: string;
                                    description: string;
                                    example: number;
                                };
                                patentId: {
                                    type: string;
                                    example: string;
                                };
                                title: {
                                    type: string;
                                    example: string;
                                };
                                abstract: {
                                    type: string;
                                    example: string;
                                };
                                claims: {
                                    type: string;
                                    example: string;
                                };
                                ipc: {
                                    type: string;
                                    example: string;
                                };
                                country: {
                                    type: string;
                                    example: string;
                                };
                                owner: {
                                    type: string;
                                    example: string;
                                };
                                publicationDate: {
                                    type: string;
                                    example: string;
                                };
                                section: {
                                    type: string;
                                    example: string;
                                };
                            };
                        };
                    };
                    noveltyAnalysis: {
                        type: string;
                        properties: {
                            summary: {
                                type: string;
                                example: string;
                            };
                            similarPatents: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        patentId: {
                                            type: string;
                                            example: string;
                                        };
                                        reason: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                            featureComparison: {
                                type: string;
                                properties: {
                                    commonFeatures: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                        example: string[];
                                    };
                                    uniqueFeatures: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                        example: string[];
                                    };
                                    partialOverlap: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                        example: string[];
                                    };
                                };
                            };
                            novelAspects: {
                                type: string;
                                items: {
                                    type: string;
                                };
                                example: string[];
                            };
                            overlappingClaims: {
                                type: string;
                                items: {
                                    type: string;
                                };
                                example: string[];
                            };
                            risks: {
                                type: string;
                                items: {
                                    type: string;
                                };
                                example: string[];
                            };
                            recommendations: {
                                type: string;
                                items: {
                                    type: string;
                                };
                                example: string[];
                            };
                        };
                    };
                };
            };
        };
        meta: {
            type: string;
            properties: {
                page: {
                    type: string;
                    example: number;
                };
                limit: {
                    type: string;
                    example: number;
                };
                totalItems: {
                    type: string;
                    example: number;
                };
                totalPages: {
                    type: string;
                    example: number;
                };
            };
        };
    };
};
export declare const AuthRegisterRequestSchema: {
    type: string;
    required: string[];
    properties: {
        email: {
            type: string;
            format: string;
            example: string;
        };
        password: {
            type: string;
            minLength: number;
            example: string;
        };
        name: {
            type: string;
            example: string;
        };
    };
};
export declare const AuthLoginRequestSchema: {
    type: string;
    required: string[];
    properties: {
        email: {
            type: string;
            format: string;
            example: string;
        };
        password: {
            type: string;
            example: string;
        };
    };
};
export declare const AuthTokenResponseSchema: {
    type: string;
    properties: {
        success: {
            type: string;
            example: boolean;
        };
        accessToken: {
            type: string;
            example: string;
        };
        refreshToken: {
            type: string;
            example: string;
        };
        tokenType: {
            type: string;
            example: string;
        };
        expiresIn: {
            type: string;
            example: number;
        };
        user: {
            type: string;
            properties: {
                id: {
                    type: string;
                    example: string;
                };
                email: {
                    type: string;
                    example: string;
                };
                name: {
                    type: string;
                    example: string;
                };
            };
        };
    };
};
export declare const BenchmarkRequestSchema: {
    type: string;
    properties: {
        topK: {
            type: string;
            minimum: number;
            maximum: number;
            default: number;
            example: number;
        };
        iterations: {
            type: string;
            minimum: number;
            maximum: number;
            default: number;
            example: number;
        };
        testQueries: {
            type: string;
            items: {
                type: string;
            };
            example: string[];
        };
    };
};
export declare const BenchmarkResponseSchema: {
    type: string;
    properties: {
        success: {
            type: string;
            example: boolean;
        };
        retrievalAccuracy: {
            type: string;
            properties: {
                precisionAtK: {
                    type: string;
                    example: number;
                };
                recallAtK: {
                    type: string;
                    example: number;
                };
                mrr: {
                    type: string;
                    example: number;
                };
                ndcg: {
                    type: string;
                    example: number;
                };
                hitRateAtK: {
                    type: string;
                    example: number;
                };
            };
        };
        performanceMetrics: {
            type: string;
            properties: {
                meanLatencyMs: {
                    type: string;
                    example: number;
                };
                p95LatencyMs: {
                    type: string;
                    example: number;
                };
                p99LatencyMs: {
                    type: string;
                    example: number;
                };
                throughputQueriesPerSec: {
                    type: string;
                    example: number;
                };
            };
        };
    };
};
export declare const HealthStatusSchema: {
    type: string;
    properties: {
        status: {
            type: string;
            example: string;
        };
        service: {
            type: string;
            example: string;
        };
        timestamp: {
            type: string;
            format: string;
            example: string;
        };
        details: {
            type: string;
            properties: {
                database: {
                    type: string;
                    example: string;
                };
                pinecone: {
                    type: string;
                    example: string;
                };
                ollama: {
                    type: string;
                    example: string;
                };
            };
        };
    };
};
export declare const DocumentUploadSuccessSchema: {
    type: string;
    properties: {
        success: {
            type: string;
            example: boolean;
        };
        document: {
            type: string;
            properties: {
                id: {
                    type: string;
                    format: string;
                    example: string;
                };
                originalFileName: {
                    type: string;
                    example: string;
                };
                storedFileName: {
                    type: string;
                    example: string;
                };
                mimeType: {
                    type: string;
                    example: string;
                };
                size: {
                    type: string;
                    example: number;
                };
                status: {
                    type: string;
                    enum: string[];
                    example: string;
                };
                uploadedAt: {
                    type: string;
                    format: string;
                    example: string;
                };
            };
        };
    };
};
export declare const DocumentDeleteSuccessSchema: {
    type: string;
    properties: {
        success: {
            type: string;
            example: boolean;
        };
        message: {
            type: string;
            example: string;
        };
    };
};
export declare const StandardPatentDocumentSchema: {
    type: string;
    required: string[];
    properties: {
        title: {
            type: string;
            description: string;
            example: string;
        };
        abstract: {
            type: string;
            description: string;
            example: string;
        };
        claims: {
            type: string;
            description: string;
            example: string;
        };
        keywords: {
            type: string;
            items: {
                type: string;
            };
            description: string;
            example: string[];
        };
        fullText: {
            type: string;
            description: string;
            example: string;
        };
    };
};
export declare const ProcessDirectTextPayloadSchema: {
    type: string;
    required: string[];
    properties: {
        title: {
            type: string;
            description: string;
            example: string;
        };
        abstract: {
            type: string;
            description: string;
            example: string;
        };
        claims: {
            type: string;
            description: string;
            example: string;
        };
        keywords: {
            type: string;
            items: {
                type: string;
            };
            description: string;
            example: string[];
        };
    };
};
export declare const ProcessDocumentSuccessSchema: {
    type: string;
    properties: {
        success: {
            type: string;
            example: boolean;
        };
        data: {
            type: string;
            required: string[];
            properties: {
                title: {
                    type: string;
                    description: string;
                    example: string;
                };
                abstract: {
                    type: string;
                    description: string;
                    example: string;
                };
                claims: {
                    type: string;
                    description: string;
                    example: string;
                };
                keywords: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                    example: string[];
                };
                fullText: {
                    type: string;
                    description: string;
                    example: string;
                };
            };
        };
    };
};
export declare const EmbedDocumentRequestSchema: {
    type: string;
    properties: {
        documentId: {
            type: string;
            format: string;
            description: string;
            example: string;
        };
        document: {
            type: string;
            required: string[];
            properties: {
                title: {
                    type: string;
                    description: string;
                    example: string;
                };
                abstract: {
                    type: string;
                    description: string;
                    example: string;
                };
                claims: {
                    type: string;
                    description: string;
                    example: string;
                };
                keywords: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                    example: string[];
                };
                fullText: {
                    type: string;
                    description: string;
                    example: string;
                };
            };
        };
    };
};
export declare const EmbedDocumentSuccessSchema: {
    type: string;
    properties: {
        success: {
            type: string;
            example: boolean;
        };
        embedding: {
            type: string;
            properties: {
                model: {
                    type: string;
                    example: string;
                };
                dimensions: {
                    type: string;
                    example: number;
                };
                sections: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
                generatedAt: {
                    type: string;
                    format: string;
                    example: string;
                };
            };
        };
    };
};
export declare const CompareDocumentRequestSchema: {
    type: string;
    properties: {
        documentId: {
            type: string;
            format: string;
            description: string;
            example: string;
        };
        document: {
            type: string;
            required: string[];
            properties: {
                title: {
                    type: string;
                    description: string;
                    example: string;
                };
                abstract: {
                    type: string;
                    description: string;
                    example: string;
                };
                claims: {
                    type: string;
                    description: string;
                    example: string;
                };
                keywords: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                    example: string[];
                };
                fullText: {
                    type: string;
                    description: string;
                    example: string;
                };
            };
        };
        topK: {
            type: string;
            minimum: number;
            maximum: number;
            default: number;
            example: number;
        };
    };
};
export declare const CompareDocumentSuccessSchema: {
    type: string;
    properties: {
        success: {
            type: string;
            example: boolean;
        };
        document: {
            type: string;
            properties: {
                id: {
                    type: string;
                    format: string;
                    example: string;
                };
                title: {
                    type: string;
                    example: string;
                };
            };
        };
        retrieval: {
            type: string;
            properties: {
                topK: {
                    type: string;
                    example: number;
                };
                retrievalConfidence: {
                    type: string;
                    example: number;
                };
            };
        };
        matches: {
            type: string;
            items: {
                type: string;
                properties: {
                    rank: {
                        type: string;
                        example: number;
                    };
                    patentId: {
                        type: string;
                        example: string;
                    };
                    title: {
                        type: string;
                        example: string;
                    };
                    similarityScore: {
                        type: string;
                        example: number;
                    };
                    ipc: {
                        type: string;
                        example: string;
                    };
                    country: {
                        type: string;
                        example: string;
                    };
                    publicationDate: {
                        type: string;
                        example: string;
                    };
                    matchingSections: {
                        type: string;
                        items: {
                            type: string;
                        };
                        example: string[];
                    };
                };
            };
        };
        analysis: {
            type: string;
            properties: {
                summary: {
                    type: string;
                    example: string;
                };
                novelty: {
                    type: string;
                    example: string;
                };
                overlappingClaims: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
                recommendations: {
                    type: string;
                    items: {
                        type: string;
                    };
                    example: string[];
                };
            };
        };
        searchHistoryId: {
            type: string;
            format: string;
            example: string;
        };
    };
};
//# sourceMappingURL=swagger.schemas.d.ts.map