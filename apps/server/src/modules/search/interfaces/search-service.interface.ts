import type { SearchQueryDto, PriorArtMatchResult } from '../dto/search.dto.js';

export interface ISearchService {
  searchPriorArt(dto: SearchQueryDto): Promise<PriorArtMatchResult[]>;
}
