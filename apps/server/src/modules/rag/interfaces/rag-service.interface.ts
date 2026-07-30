import type { HybridRankingDto, RankedPatentCandidate } from '../dto/rag.dto.js';

export interface IRagService {
  hybridRank(dto: HybridRankingDto): Promise<RankedPatentCandidate[]>;
  rerankCrossEncoder(candidates: RankedPatentCandidate[], topK?: number): Promise<RankedPatentCandidate[]>;
}
