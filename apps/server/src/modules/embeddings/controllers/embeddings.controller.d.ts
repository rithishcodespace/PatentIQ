import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IEmbeddingsService } from '../interfaces/embeddings-service.interface.js';
import type { GenerateEmbeddingDto, BatchGenerateEmbeddingDto } from '../dto/embeddings.dto.js';
export declare class EmbeddingsController {
    private readonly embeddingsService;
    constructor(embeddingsService: IEmbeddingsService);
    generate(request: FastifyRequest<{
        Body: GenerateEmbeddingDto;
    }>, reply: FastifyReply): Promise<void>;
    generateBatch(request: FastifyRequest<{
        Body: BatchGenerateEmbeddingDto;
    }>, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=embeddings.controller.d.ts.map