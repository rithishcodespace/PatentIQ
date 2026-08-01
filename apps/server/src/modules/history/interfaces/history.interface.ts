import type {
  CreateSearchHistoryDto,
  CreateNoveltyAnalysisDto,
  SaveCompleteSearchAndAnalysisDto,
  HistoryQueryFilterDto,
  HistoryListResponseDto,
} from '../dto/history.dto.js';

export interface IHistoryRepository {
  /**
   * Saves a search history record along with retrieved patents atomically.
   */
  createSearchHistory(dto: CreateSearchHistoryDto): Promise<any>;

  /**
   * Saves a novelty analysis record linked to a search history ID.
   */
  createNoveltyAnalysis(dto: CreateNoveltyAnalysisDto): Promise<any>;

  /**
   * Atomically saves SearchHistory, RetrievedPatents, and NoveltyAnalysis in a single transaction.
   */
  saveCompleteHistoryAtomically(dto: SaveCompleteSearchAndAnalysisDto): Promise<any>;

  /**
   * Retrieves a search history record by ID including nested retrieved patents and novelty analysis.
   */
  findById(id: string): Promise<any | null>;

  /**
   * Retrieves paginated search history records matching query filters.
   */
  findManyWithFilters(filters: HistoryQueryFilterDto): Promise<{ items: any[]; totalItems: number }>;

  /**
   * Deletes a search history record by ID (triggers cascading delete of patents & novelty analysis).
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Finds an existing search history record matching exact query and filters that already has a novelty analysis.
   */
  findExistingAnalysis(searchQuery: string, appliedFilters?: Record<string, any> | null): Promise<any | null>;
}

export interface IHistoryService {
  /**
   * Atomically persists a search execution with its retrieved patent matches.
   */
  saveSearchHistory(dto: CreateSearchHistoryDto): Promise<any>;

  /**
   * Persists AI-generated novelty analysis.
   */
  saveNoveltyAnalysis(dto: CreateNoveltyAnalysisDto): Promise<any>;

  /**
   * Atomically saves SearchHistory, RetrievedPatents, and NoveltyAnalysis in a single transaction.
   */
  saveCompleteSearchAndAnalysis(dto: SaveCompleteSearchAndAnalysisDto): Promise<any>;

  /**
   * Retrieves a detailed search history record by ID.
   */
  getHistoryById(id: string): Promise<any>;

  /**
   * Retrieves paginated and filtered history list.
   */
  listHistory(filters: HistoryQueryFilterDto): Promise<HistoryListResponseDto>;

  /**
   * Deletes a search history entry by ID.
   */
  deleteHistory(id: string): Promise<{ success: boolean; message: string }>;

  /**
   * Attempts to find a previously generated analysis for exact query reuse.
   */
  findReusableAnalysis(searchQuery: string, appliedFilters?: Record<string, any> | null): Promise<any | null>;
}
