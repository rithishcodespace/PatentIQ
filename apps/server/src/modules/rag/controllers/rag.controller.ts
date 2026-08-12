import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IRagService } from '../interfaces/rag.interface.js';
import {
  RagAnalysisRequestDtoSchema,
  type RagAnalysisRequestDto,
  HybridRankingDtoSchema,
  type HybridRankingDto,
  DesignAroundRequestDtoSchema,
} from '../dto/rag.dto.js';
import { EvidenceAnalysisRequestSchema } from '../dto/evidence-analysis.dto.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';
import type { DesignAroundService } from '../services/design-around.service.js';
import { EvidenceAnalysisService } from '../services/evidence-analysis.service.js';

export class RagController {
  private readonly evidenceAnalysisService: EvidenceAnalysisService;

  constructor(
    private readonly ragService: IRagService,
    private readonly designAroundService?: DesignAroundService,
    evidenceAnalysisService?: EvidenceAnalysisService
  ) {
    this.evidenceAnalysisService = evidenceAnalysisService || new EvidenceAnalysisService();
  }

  /**
   * Endpoint Handler: POST /api/rag/analyze
   * Performs semantic retrieval, 7-section novelty analysis, and section/claim overlap analysis via Ollama (Qwen).
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
    const retrievedCount = response.retrievedPatents ? response.retrievedPatents.length : (metrics?.retrievedCount ?? 0);
    request.log.info(
      `[RagAPI] query="${response.query}" | retrievedCount=${retrievedCount} | overlappingClaims=${metrics?.overlappingClaimsCount ?? 0} | retrievalMs=${metrics?.retrievalTimeMs ?? 0}ms | promptMs=${metrics?.promptTimeMs ?? 0}ms | llmMs=${metrics?.llmInferenceTimeMs ?? 0}ms | totalMs=${metrics?.totalTimeMs ?? 0}ms`
    );

    // 4. Return JSON response payload
    const responsePayload: Record<string, any> = {
      success: response.success,
      query: response.query,
      analysis: response.analysis,
    };

    if (response.deconstructedFeatures) {
      responsePayload.deconstructedFeatures = response.deconstructedFeatures;
    }

    if (response.overlapAnalysis) {
      responsePayload.overlapAnalysis = response.overlapAnalysis;
    }

    if (response.retrievedPatents && response.retrievedPatents.length > 0) {
      responsePayload.retrievedPatents = response.retrievedPatents;
    }

    reply.status(200).send(responsePayload);
  }

  /**
   * Endpoint Handler: POST /api/rag/deconstruct
   * Deconstructs plain text invention query/disclosure into structured technical features.
   */
  async deconstruct(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.body || typeof request.body !== 'object') {
      throw new BadRequestError('Request body is required');
    }

    const body = request.body as Record<string, any>;
    const inputQuery = body.query || body.text || '';

    if (!inputQuery || typeof inputQuery !== 'string' || !inputQuery.trim()) {
      throw new BadRequestError('query or text is required');
    }

    const result = await this.ragService.deconstructInvention(inputQuery.trim());

    reply.status(200).send({
      success: true,
      data: result,
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

  /**
   * Endpoint Handler: POST /api/rag/design-around
   * Generates actionable engineering design-around recommendations.
   */
  async designAround(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.body || typeof request.body !== 'object') {
      throw new BadRequestError('Request body is required');
    }

    const parseResult = DesignAroundRequestDtoSchema.safeParse(request.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      throw new BadRequestError(issue ? issue.message : 'Invalid design-around request payload');
    }

    if (!this.designAroundService) {
      throw new BadRequestError('Design-Around recommendation service is not initialized');
    }

    const result = await this.designAroundService.generateDesignAround(parseResult.data);
    reply.status(200).send({
      success: true,
      data: result,
    });
  }

  /**
   * Endpoint Handler: POST /api/rag/evidence-analysis
   * Performs evidence-based prior-art analysis mapping disclosure limitations to verbatim claim snippets.
   */
  async analyzeEvidence(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.body || typeof request.body !== 'object') {
      throw new BadRequestError('Request body is required');
    }

    const parseResult = EvidenceAnalysisRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      throw new BadRequestError(issue ? issue.message : 'Invalid evidence analysis request payload');
    }

    const result = await this.evidenceAnalysisService.analyzeEvidence(parseResult.data);
    reply.status(200).send(result);
  }
}
