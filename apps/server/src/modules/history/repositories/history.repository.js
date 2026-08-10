import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { databaseConfig } from '../../../config/database.config.js';
let defaultPrismaClient = null;
function getDefaultPrismaClient() {
    if (!defaultPrismaClient) {
        const pool = new pg.Pool({ connectionString: databaseConfig.url });
        const adapter = new PrismaPg(pool);
        defaultPrismaClient = new PrismaClient({ adapter });
    }
    return defaultPrismaClient;
}
export class HistoryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma || getDefaultPrismaClient();
    }
    /**
     * Saves search history and nested retrieved patents atomically within a Prisma transaction.
     */
    async createSearchHistory(dto) {
        return this.prisma.$transaction(async (tx) => {
            const createdSearch = await tx.searchHistory.create({
                data: {
                    userId: dto.userId || null,
                    searchQuery: dto.searchQuery,
                    topK: dto.topK,
                    appliedFilters: dto.appliedFilters ? dto.appliedFilters : undefined,
                    totalResults: dto.totalResults,
                    searchLatency: dto.searchLatency,
                },
            });
            if (dto.retrievedPatents && dto.retrievedPatents.length > 0) {
                await tx.retrievedPatent.createMany({
                    data: dto.retrievedPatents.map((p) => ({
                        searchHistoryId: createdSearch.id,
                        patentId: p.patentId,
                        title: p.title,
                        similarityScore: p.similarityScore,
                        ipc: p.ipc || null,
                        country: p.country || null,
                        publicationDate: p.publicationDate ? new Date(p.publicationDate) : null,
                        owner: p.owner || null,
                        metadata: p.metadata ? p.metadata : undefined,
                    })),
                });
            }
            return tx.searchHistory.findUnique({
                where: { id: createdSearch.id },
                include: { retrievedPatents: true, noveltyAnalysis: true },
            });
        });
    }
    /**
     * Saves a standalone novelty analysis linked to an existing search history ID.
     */
    async createNoveltyAnalysis(dto) {
        return this.prisma.noveltyAnalysis.create({
            data: {
                searchHistoryId: dto.searchHistoryId,
                summary: dto.summary,
                novelty: dto.novelty,
                overlappingClaims: dto.overlappingClaims,
                recommendations: dto.recommendations,
                confidenceScore: dto.confidenceScore,
                rawLLMResponse: dto.rawLLMResponse,
            },
        });
    }
    /**
     * Atomically creates SearchHistory, RetrievedPatents, and NoveltyAnalysis in a single transaction.
     * If any step fails, the entire transaction is rolled back.
     */
    async saveCompleteHistoryAtomically(dto) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Create SearchHistory record
            const createdSearch = await tx.searchHistory.create({
                data: {
                    userId: dto.userId || null,
                    searchQuery: dto.searchQuery,
                    topK: dto.topK,
                    appliedFilters: dto.appliedFilters ? dto.appliedFilters : undefined,
                    totalResults: dto.totalResults,
                    searchLatency: dto.searchLatency,
                },
            });
            // 2. Create RetrievedPatents records
            if (dto.retrievedPatents && dto.retrievedPatents.length > 0) {
                await tx.retrievedPatent.createMany({
                    data: dto.retrievedPatents.map((p) => ({
                        searchHistoryId: createdSearch.id,
                        patentId: p.patentId,
                        title: p.title,
                        similarityScore: p.similarityScore,
                        ipc: p.ipc || null,
                        country: p.country || null,
                        publicationDate: p.publicationDate ? new Date(p.publicationDate) : null,
                        owner: p.owner || null,
                        metadata: p.metadata ? p.metadata : undefined,
                    })),
                });
            }
            // 3. Create NoveltyAnalysis record if provided
            if (dto.noveltyAnalysis) {
                await tx.noveltyAnalysis.create({
                    data: {
                        searchHistoryId: createdSearch.id,
                        summary: dto.noveltyAnalysis.summary,
                        novelty: dto.noveltyAnalysis.novelty,
                        overlappingClaims: dto.noveltyAnalysis.overlappingClaims,
                        recommendations: dto.noveltyAnalysis.recommendations,
                        confidenceScore: dto.noveltyAnalysis.confidenceScore,
                        rawLLMResponse: dto.noveltyAnalysis.rawLLMResponse,
                    },
                });
            }
            // 4. Return full populated record
            return tx.searchHistory.findUnique({
                where: { id: createdSearch.id },
                include: {
                    retrievedPatents: true,
                    noveltyAnalysis: true,
                },
            });
        });
    }
    /**
     * Retrieves a SearchHistory record by ID including nested patents and novelty analysis.
     */
    async findById(id) {
        return this.prisma.searchHistory.findUnique({
            where: { id },
            include: {
                retrievedPatents: true,
                noveltyAnalysis: true,
            },
        });
    }
    /**
     * Lists history entries supporting pagination, sorting, and multi-field filters.
     */
    async findManyWithFilters(filters) {
        const { page, limit, sortBy, sortOrder, startDate, endDate, query, ipc, minScore, maxScore, userId, } = filters;
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        if (query) {
            where.searchQuery = {
                contains: query,
                mode: 'insensitive',
            };
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }
        const patentFilters = {};
        if (ipc) {
            patentFilters.ipc = {
                contains: ipc,
                mode: 'insensitive',
            };
        }
        if (minScore !== undefined || maxScore !== undefined) {
            patentFilters.similarityScore = {};
            if (minScore !== undefined) {
                patentFilters.similarityScore.gte = minScore;
            }
            if (maxScore !== undefined) {
                patentFilters.similarityScore.lte = maxScore;
            }
        }
        if (Object.keys(patentFilters).length > 0) {
            where.retrievedPatents = {
                some: patentFilters,
            };
        }
        const skip = (page - 1) * limit;
        const [items, totalItems] = await Promise.all([
            this.prisma.searchHistory.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
                include: {
                    retrievedPatents: true,
                    noveltyAnalysis: true,
                },
            }),
            this.prisma.searchHistory.count({ where }),
        ]);
        return { items, totalItems };
    }
    /**
     * Deletes a search history record by ID. Prisma schema onDelete: Cascade automatically deletes linked patents & analysis.
     */
    async deleteById(id) {
        try {
            await this.prisma.searchHistory.delete({
                where: { id },
            });
            return true;
        }
        catch (err) {
            // Prisma P2025: Record to delete does not exist.
            if (err?.code === 'P2025') {
                return false;
            }
            throw err;
        }
    }
    /**
     * Finds an existing search history record matching exact searchQuery and filters that already has a completed novelty analysis.
     */
    async findExistingAnalysis(searchQuery, appliedFilters) {
        const trimmed = searchQuery.trim();
        const where = {
            searchQuery: {
                equals: trimmed,
                mode: 'insensitive',
            },
            noveltyAnalysis: {
                isNot: null,
            },
        };
        const records = await this.prisma.searchHistory.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
                retrievedPatents: true,
                noveltyAnalysis: true,
            },
        });
        return records.length > 0 ? records[0] : null;
    }
}
//# sourceMappingURL=history.repository.js.map