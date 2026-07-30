import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IEmbeddingsService } from '../interfaces/embeddings-service.interface.js';
import type { GenerateEmbeddingDto, BatchGenerateEmbeddingDto } from '../dto/embeddings.dto.js';
import { ResponseFormatter } from '../../../common/utils/response.formatter.js';

export class EmbeddingsController {
  constructor(private readonly embeddingsService: IEmbeddingsService) {}

  async generate(request: FastifyRequest<{ Body: GenerateEmbeddingDto }>, reply: FastifyReply): Promise<void> {
    const result = await this.embeddingsService.generateAndStoreEmbedding(request.body);
    reply.send(ResponseFormatter.success(result, 'Embedding generated and stored'));
  }

  async generateBatch(request: FastifyRequest<{ Body: BatchGenerateEmbeddingDto }>, reply: FastifyReply): Promise<void> {
    const result = await this.embeddingsService.generateBatchAndStoreEmbeddings(request.body);
    reply.send(ResponseFormatter.success(result, 'Batch embeddings generated and stored'));
  }
}
