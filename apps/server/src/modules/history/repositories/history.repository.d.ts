import { PrismaClient } from '@prisma/client';
import type { IHistoryRepository } from '../interfaces/history.interface.js';
import type { CreateSearchHistoryDto, CreateNoveltyAnalysisDto, SaveCompleteSearchAndAnalysisDto, HistoryQueryFilterDto } from '../dto/history.dto.js';
export declare class HistoryRepository implements IHistoryRepository {
    private readonly prisma;
    constructor(prisma?: PrismaClient);
    /**
     * Saves search history and nested retrieved patents atomically within a Prisma transaction.
     */
    createSearchHistory(dto: CreateSearchHistoryDto): Promise<any>;
    /**
     * Saves a standalone novelty analysis linked to an existing search history ID.
     */
    createNoveltyAnalysis(dto: CreateNoveltyAnalysisDto): Promise<any>;
    /**
     * Atomically creates SearchHistory, RetrievedPatents, and NoveltyAnalysis in a single transaction.
     * If any step fails, the entire transaction is rolled back.
     */
    saveCompleteHistoryAtomically(dto: SaveCompleteSearchAndAnalysisDto): Promise<any>;
    /**
     * Retrieves a SearchHistory record by ID including nested patents and novelty analysis.
     */
    findById(id: string): Promise<any | null>;
    /**
     * Lists history entries supporting pagination, sorting, and multi-field filters.
     */
    findManyWithFilters(filters: HistoryQueryFilterDto): Promise<{
        items: any[];
        totalItems: number;
    }>;
    /**
     * Deletes a search history record by ID. Prisma schema onDelete: Cascade automatically deletes linked patents & analysis.
     */
    deleteById(id: string): Promise<boolean>;
    /**
     * Finds an existing search history record matching exact searchQuery and filters that already has a completed novelty analysis.
     */
    findExistingAnalysis(searchQuery: string, appliedFilters?: Record<string, any> | null): Promise<any | null>;
}
//# sourceMappingURL=history.repository.d.ts.map