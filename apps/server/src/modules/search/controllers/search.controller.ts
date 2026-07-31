import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ISearchService } from '../interfaces/search.interface.js';
import { SearchRequestDtoSchema, type SearchRequestDto } from '../dto/search.dto.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';

export class SearchController {
  constructor(private readonly searchService: ISearchService) {}

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

    // 3. Log performance metrics and applied filters via Fastify logger
    if (response.metrics) {
      const filterLog = response.filters ? ` | Filters: ${JSON.stringify(response.filters)}` : '';
      request.log.info(
        `[SearchAPI] Query: "${response.query}"${filterLog} | Matches: ${response.count} | Total: ${response.metrics.totalExecutionTimeMs}ms | Embedding: ${response.metrics.queryEmbeddingTimeMs}ms | Pinecone: ${response.metrics.pineconeSearchTimeMs}ms`
      );
    }

    // 4. Return JSON response
    reply.status(200).send(response);
  }

  /**
   * Backward-compatible handler for POST /api/v1/search/prior-art.
   */
  async searchPriorArt(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.search(request, reply);
  }
}


