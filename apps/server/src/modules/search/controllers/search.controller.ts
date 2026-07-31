import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ISearchService } from '../interfaces/search.interface.js';
import type { BenchmarkController } from './benchmark.controller.js';
import { SearchRequestDtoSchema, type SearchRequestDto } from '../dto/search.dto.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';

export class SearchController {
  constructor(
    private readonly searchService: ISearchService,
    public readonly benchmarkController?: BenchmarkController
  ) {}

  /**
   * HTTP POST /api/search Handler.
   */
  async search(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.body || typeof request.body !== 'object') {
      throw new BadRequestError('query is required');
    }

    // 1. Validate request payload using Zod schema
    const parseResult = SearchRequestDtoSchema.safeParse(request.body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      const errorMessage = issue ? issue.message : 'Invalid request payload';
      throw new BadRequestError(errorMessage);
    }

    const validatedDto: SearchRequestDto = parseResult.data;

    // 2. Call service layer
    const response = await this.searchService.search(validatedDto);

    // 3. Log performance summary metrics without full payload
    const highestScore = response.results && response.results.length > 0 ? response.results[0]?.score ?? 0 : 0;
    const latencyMs = response.metrics?.totalExecutionTimeMs ?? 0;
    const requestedTopK = validatedDto.topK ?? 10;

    request.log.info(
      `[SearchAPI] query="${response.query}" | topK=${requestedTopK} | count=${response.count} | highestScore=${highestScore} | latency=${latencyMs}ms`
    );

    // 4. Return JSON response
    reply.status(200).send(response);
  }

  /**
   * Endpoint Handler: POST /api/search/benchmark
   */
  async benchmark(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (this.benchmarkController) {
      return this.benchmarkController.benchmark(request, reply);
    }
    throw new BadRequestError('Benchmark feature is not available');
  }

  /**
   * Backward-compatible handler for POST /api/v1/search/prior-art.
   */
  async searchPriorArt(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.search(request, reply);
  }
}
