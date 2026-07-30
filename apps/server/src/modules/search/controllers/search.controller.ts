import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ISearchService } from '../interfaces/search-service.interface.js';
import type { SearchQueryDto } from '../dto/search.dto.js';
import { ResponseFormatter } from '../../../common/utils/response.formatter.js';

export class SearchController {
  constructor(private readonly searchService: ISearchService) {}

  async searchPriorArt(request: FastifyRequest<{ Body: SearchQueryDto }>, reply: FastifyReply): Promise<void> {
    const results = await this.searchService.searchPriorArt(request.body);
    reply.send(ResponseFormatter.success(results, 'Prior art search completed successfully'));
  }
}
