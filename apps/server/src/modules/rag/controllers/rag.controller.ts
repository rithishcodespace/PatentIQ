import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IRagService } from '../interfaces/rag-service.interface.js';
import type { HybridRankingDto } from '../dto/rag.dto.js';
import { ResponseFormatter } from '../../../common/utils/response.formatter.js';

export class RagController {
  constructor(private readonly ragService: IRagService) {}

  async rank(request: FastifyRequest<{ Body: HybridRankingDto }>, reply: FastifyReply): Promise<void> {
    const candidates = await this.ragService.hybridRank(request.body);
    const reranked = await this.ragService.rerankCrossEncoder(candidates);
    reply.send(ResponseFormatter.success(reranked, 'Hybrid RAG ranking completed'));
  }
}
