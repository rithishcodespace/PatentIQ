import type { IHistoryService, IHistoryRepository } from '../interfaces/history.interface.js';
import type { CreateSearchHistoryDto, CreateNoveltyAnalysisDto, SaveCompleteSearchAndAnalysisDto, HistoryQueryFilterDto, HistoryListResponseDto } from '../dto/history.dto.js';
export declare class HistoryService implements IHistoryService {
    private readonly historyRepository;
    constructor(historyRepository?: IHistoryRepository);
    /**
     * Saves a search history record with retrieved patents.
     */
    saveSearchHistory(dto: CreateSearchHistoryDto): Promise<any>;
    /**
     * Saves AI-generated novelty analysis linked to search history ID.
     */
    saveNoveltyAnalysis(dto: CreateNoveltyAnalysisDto): Promise<any>;
    /**
     * Atomically saves SearchHistory, RetrievedPatents, and NoveltyAnalysis in a single transaction.
     */
    saveCompleteSearchAndAnalysis(dto: SaveCompleteSearchAndAnalysisDto): Promise<any>;
    /**
     * Retrieves detailed search history record by ID.
     */
    getHistoryById(id: string): Promise<any>;
    /**
     * Retrieves paginated and filtered history list.
     */
    listHistory(filters: HistoryQueryFilterDto): Promise<HistoryListResponseDto>;
    /**
     * Deletes search history record by ID (cascades to patents and novelty analysis).
     */
    deleteHistory(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Reuses existing analysis if exact query match with completed analysis is found.
     */
    findReusableAnalysis(searchQuery: string, appliedFilters?: Record<string, any> | null): Promise<any | null>;
}
//# sourceMappingURL=history.service.d.ts.map