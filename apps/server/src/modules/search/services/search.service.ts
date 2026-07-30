import type { ISearchService } from '../interfaces/search-service.interface.js';
import type { SearchQueryDto, PriorArtMatchResult } from '../dto/search.dto.js';
import type { IEmbeddingProvider } from '../../../providers/embedding/embedding-provider.interface.js';
import type { IVectorStoreProvider } from '../../../providers/vectorstore/vectorstore-provider.interface.js';
import { PatentsRepository } from '../../patents/repositories/patents.repository.js';

export class SearchService implements ISearchService {
  constructor(
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly vectorStoreProvider: IVectorStoreProvider,
    private readonly _patentsRepository: PatentsRepository
  ) {}

  async searchPriorArt(dto: SearchQueryDto): Promise<PriorArtMatchResult[]> {
    const queryVector = await this.embeddingProvider.generateEmbedding(dto.query);
    const matches = await this.vectorStoreProvider.querySimilarity(queryVector, dto.topK ?? 100, {
      ipc: dto.ipcFilter,
    });

    console.log(`[SearchService] Searching prior art for: "${dto.query}" - found ${matches.length} vector matches`);
    return matches.map((m, idx) => ({
      patentId: m.id,
      patentNumber: `US-PAT-${idx + 1}`,
      title: `Prior Art Patent ${idx + 1}`,
      abstract: 'Sample patent abstract...',
      similarityScore: m.score,
      ipcClassifications: ['G06F 17/30'],
    }));
  }
}
