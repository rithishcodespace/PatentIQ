import { HistoryRepository } from '../repositories/history.repository.js';
import { NotFoundError, BadRequestError, InternalServerError } from '../../../common/errors/http-errors.js';
export class HistoryService {
    historyRepository;
    constructor(historyRepository) {
        this.historyRepository = historyRepository || new HistoryRepository();
    }
    /**
     * Saves a search history record with retrieved patents.
     */
    async saveSearchHistory(dto) {
        if (!dto.searchQuery || !dto.searchQuery.trim()) {
            throw new BadRequestError('Search query cannot be empty');
        }
        const startTime = Date.now();
        try {
            const record = await this.historyRepository.createSearchHistory({
                ...dto,
                searchQuery: dto.searchQuery.trim(),
            });
            const dbLatency = Date.now() - startTime;
            console.log(`[HistoryService] Search saved | id=${record.id} | query="${record.searchQuery}" | resultsCount=${dto.totalResults} | dbLatency=${dbLatency}ms`);
            return record;
        }
        catch (err) {
            console.error(`[HistoryService] Failed to save search history: ${err.message}`, err);
            throw new InternalServerError(`Failed to save search history: ${err.message}`);
        }
    }
    /**
     * Saves AI-generated novelty analysis linked to search history ID.
     */
    async saveNoveltyAnalysis(dto) {
        if (!dto.searchHistoryId) {
            throw new BadRequestError('searchHistoryId is required');
        }
        const startTime = Date.now();
        try {
            const record = await this.historyRepository.createNoveltyAnalysis(dto);
            const dbLatency = Date.now() - startTime;
            // Note: Do NOT log full raw LLM responses to logs
            console.log(`[HistoryService] Analysis saved | searchHistoryId=${dto.searchHistoryId} | confidenceScore=${dto.confidenceScore} | dbLatency=${dbLatency}ms`);
            return record;
        }
        catch (err) {
            console.error(`[HistoryService] Failed to save novelty analysis: ${err.message}`, err);
            throw new InternalServerError(`Failed to save novelty analysis: ${err.message}`);
        }
    }
    /**
     * Atomically saves SearchHistory, RetrievedPatents, and NoveltyAnalysis in a single transaction.
     */
    async saveCompleteSearchAndAnalysis(dto) {
        if (!dto.searchQuery || !dto.searchQuery.trim()) {
            throw new BadRequestError('Search query cannot be empty');
        }
        const startTime = Date.now();
        try {
            const record = await this.historyRepository.saveCompleteHistoryAtomically({
                ...dto,
                searchQuery: dto.searchQuery.trim(),
            });
            const dbLatency = Date.now() - startTime;
            console.log(`[HistoryService] Search & Analysis saved atomically | id=${record.id} | query="${record.searchQuery}" | patentsCount=${dto.retrievedPatents?.length ?? 0} | hasAnalysis=${!!dto.noveltyAnalysis} | dbLatency=${dbLatency}ms`);
            return record;
        }
        catch (err) {
            console.error(`[HistoryService] Transaction failed while saving history & analysis: ${err.message}`, err);
            throw new InternalServerError(`Failed to save search and novelty analysis atomically: ${err.message}`);
        }
    }
    /**
     * Retrieves detailed search history record by ID.
     */
    async getHistoryById(id) {
        if (!id || !id.trim()) {
            throw new BadRequestError('Search history ID is required');
        }
        const startTime = Date.now();
        const record = await this.historyRepository.findById(id.trim());
        const dbLatency = Date.now() - startTime;
        if (!record) {
            throw new NotFoundError(`Search history record with ID '${id}' not found`);
        }
        console.log(`[HistoryService] History retrieval | id=${id} | dbLatency=${dbLatency}ms`);
        return record;
    }
    /**
     * Retrieves paginated and filtered history list.
     */
    async listHistory(filters) {
        const startTime = Date.now();
        const { items, totalItems } = await this.historyRepository.findManyWithFilters(filters);
        const dbLatency = Date.now() - startTime;
        const page = filters.page;
        const limit = filters.limit;
        const totalPages = Math.ceil(totalItems / limit) || 1;
        console.log(`[HistoryService] History retrieval | page=${page} | limit=${limit} | count=${items.length} | totalItems=${totalItems} | dbLatency=${dbLatency}ms`);
        return {
            success: true,
            data: items,
            meta: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
    /**
     * Deletes search history record by ID (cascades to patents and novelty analysis).
     */
    async deleteHistory(id) {
        if (!id || !id.trim()) {
            throw new BadRequestError('Search history ID is required');
        }
        const startTime = Date.now();
        const deleted = await this.historyRepository.deleteById(id.trim());
        const dbLatency = Date.now() - startTime;
        if (!deleted) {
            throw new NotFoundError(`Search history record with ID '${id}' not found`);
        }
        console.log(`[HistoryService] History deletion | id=${id} | dbLatency=${dbLatency}ms`);
        return {
            success: true,
            message: `Search history record '${id}' and associated analysis successfully deleted`,
        };
    }
    /**
     * Reuses existing analysis if exact query match with completed analysis is found.
     */
    async findReusableAnalysis(searchQuery, appliedFilters) {
        if (!searchQuery || !searchQuery.trim()) {
            return null;
        }
        try {
            const existing = await this.historyRepository.findExistingAnalysis(searchQuery, appliedFilters);
            if (existing) {
                console.log(`[HistoryService] Reusing existing novelty analysis for query="${searchQuery}" | historyId=${existing.id}`);
            }
            return existing;
        }
        catch (err) {
            console.warn(`[HistoryService] Failed to check reusable analysis: ${err.message}`);
            return null;
        }
    }
}
//# sourceMappingURL=history.service.js.map