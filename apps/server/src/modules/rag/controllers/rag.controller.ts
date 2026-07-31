import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IRagService } from '../interfaces/rag.interface.js';
import {
  RagAnalysisRequestDtoSchema,
  type RagAnalysisRequestDto,
  HybridRankingDtoSchema,
  type HybridRankingDto,
} from '../dto/rag.dto.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';

export class RagController {
  constructor(private readonly ragService: IRagService) {}

  /**
   * Endpoint Handler: POST /api/rag/analyze
   * Performs semantic retrieval of prior art and generates AI novelty analysis via Ollama (Qwen).
   */
  async analyze(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // 1. Zod Validation
    const parseResult = RagAnalysisRequestDtoSchema.safeParse(request.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      const errorMessage = issue ? issue.message : 'Invalid search request body';
      throw new BadRequestError(errorMessage);
    }

    const validatedDto: RagAnalysisRequestDto = parseResult.data;

    // 2. Call RAG Service pipeline
    const response = await this.ragService.analyze(validatedDto);

    // 3. Log Performance Summary Metrics without logging full prompt or payload
    const metrics = response.metrics;
    request.log.info(
      `[RagAPI] query="${response.query}" | retrievedCount=${response.retrievedPatents.length} | retrievalMs=${metrics?.retrievalTimeMs ?? 0}ms | promptMs=${metrics?.promptTimeMs ?? 0}ms | llmMs=${metrics?.llmInferenceTimeMs ?? 0}ms | totalMs=${metrics?.totalTimeMs ?? 0}ms`
    );

    // 4. Return JSON response
    reply.status(200).send({
      success: response.success,
      query: response.query,
      retrievedPatents: response.retrievedPatents,
      analysis: response.analysis,
    });
  }

  /**
   * Backward-compatible endpoint handler: POST /api/rag/rank
   */
  async rank(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parseResult = HybridRankingDtoSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new BadRequestError('Invalid hybrid ranking request body');
    }

    const candidates = await this.ragService.hybridRank(parseResult.data);
    const reranked = await this.ragService.rerankCrossEncoder(candidates);
    reply.status(200).send({
      success: true,
      data: reranked,
      message: 'Hybrid RAG ranking completed',
    });
  }
}
