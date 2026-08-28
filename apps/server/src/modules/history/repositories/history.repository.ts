import { PrismaClient } from '@prisma/client';
import type { IHistoryRepository } from '../interfaces/history.interface.js';
import type {
  CreateSearchHistoryDto,
  CreateNoveltyAnalysisDto,
  SaveCompleteSearchAndAnalysisDto,
  HistoryQueryFilterDto,
} from '../dto/history.dto.js';

import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { databaseConfig } from '../../../config/database.config.js';

let defaultPrismaClient: PrismaClient | null = null;

function getDefaultPrismaClient(): PrismaClient {
  if (!defaultPrismaClient) {
    const pool = new pg.Pool({ connectionString: databaseConfig.url });
    const adapter = new PrismaPg(pool);
    defaultPrismaClient = new PrismaClient({ adapter });
  }
  return defaultPrismaClient;
}

export class HistoryRepository implements IHistoryRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || getDefaultPrismaClient();
  }

  /**
   * Saves search history and nested retrieved patents atomically within a Prisma transaction.
   * Reuses recent search history records for identical search queries to prevent database duplicates.
   */
  async createSearchHistory(dto: CreateSearchHistoryDto): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.searchHistory.findFirst({
        where: {
          searchQuery: {
            equals: dto.searchQuery,
            mode: 'insensitive',
          },
          createdAt: {
            gte: new Date(Date.now() - 10 * 60 * 1000),
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      let searchId: string;
      if (existing) {
        searchId = existing.id;
        await tx.searchHistory.update({
          where: { id: searchId },
          data: {
            topK: dto.topK,
            appliedFilters: dto.appliedFilters ? (dto.appliedFilters as any) : undefined,
            totalResults: dto.totalResults,
            searchLatency: dto.searchLatency,
          },
        });
        await tx.retrievedPatent.deleteMany({
          where: { searchHistoryId: searchId },
        });
      } else {
        const createdSearch = await tx.searchHistory.create({
          data: {
            userId: dto.userId || null,
            searchQuery: dto.searchQuery,
            topK: dto.topK,
            appliedFilters: dto.appliedFilters ? (dto.appliedFilters as any) : undefined,
            totalResults: dto.totalResults,
            searchLatency: dto.searchLatency,
          },
        });
        searchId = createdSearch.id;
      }

      if (dto.retrievedPatents && dto.retrievedPatents.length > 0) {
        await tx.retrievedPatent.createMany({
          data: dto.retrievedPatents.map((p) => ({
            searchHistoryId: searchId,
            patentId: p.patentId,
            title: p.title,
            similarityScore: p.similarityScore,
            ipc: p.ipc || null,
            country: p.country || null,
            publicationDate: p.publicationDate ? new Date(p.publicationDate) : null,
            owner: p.owner || null,
            metadata: p.metadata ? (p.metadata as any) : undefined,
          })),
        });
      }

      return tx.searchHistory.findUnique({
        where: { id: searchId },
        include: { retrievedPatents: true, noveltyAnalysis: true },
      });
    });
  }

  /**
   * Saves a standalone novelty analysis linked to an existing search history ID.
   */
  async createNoveltyAnalysis(dto: CreateNoveltyAnalysisDto): Promise<any> {
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
   * Atomically creates or updates SearchHistory, RetrievedPatents, and NoveltyAnalysis in a single transaction.
   * Reuses recent search history for the same query to prevent duplicate records.
   */
  async saveCompleteHistoryAtomically(dto: SaveCompleteSearchAndAnalysisDto): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.searchHistory.findFirst({
        where: {
          searchQuery: {
            equals: dto.searchQuery,
            mode: 'insensitive',
          },
          createdAt: {
            gte: new Date(Date.now() - 10 * 60 * 1000),
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      let searchId: string;
      if (existing) {
        searchId = existing.id;
        await tx.searchHistory.update({
          where: { id: searchId },
          data: {
            topK: dto.topK,
            appliedFilters: dto.appliedFilters ? (dto.appliedFilters as any) : undefined,
            totalResults: dto.totalResults,
            searchLatency: dto.searchLatency,
          },
        });
        await tx.retrievedPatent.deleteMany({
          where: { searchHistoryId: searchId },
        });
      } else {
        const createdSearch = await tx.searchHistory.create({
          data: {
            userId: dto.userId || null,
            searchQuery: dto.searchQuery,
            topK: dto.topK,
            appliedFilters: dto.appliedFilters ? (dto.appliedFilters as any) : undefined,
            totalResults: dto.totalResults,
            searchLatency: dto.searchLatency,
          },
        });
        searchId = createdSearch.id;
      }

      if (dto.retrievedPatents && dto.retrievedPatents.length > 0) {
        await tx.retrievedPatent.createMany({
          data: dto.retrievedPatents.map((p) => ({
            searchHistoryId: searchId,
            patentId: p.patentId,
            title: p.title,
            similarityScore: p.similarityScore,
            ipc: p.ipc || null,
            country: p.country || null,
            publicationDate: p.publicationDate ? new Date(p.publicationDate) : null,
            owner: p.owner || null,
            metadata: p.metadata ? (p.metadata as any) : undefined,
          })),
        });
      }

      if (dto.noveltyAnalysis) {
        await tx.noveltyAnalysis.upsert({
          where: { searchHistoryId: searchId },
          create: {
            searchHistoryId: searchId,
            summary: dto.noveltyAnalysis.summary,
            novelty: dto.noveltyAnalysis.novelty,
            overlappingClaims: dto.noveltyAnalysis.overlappingClaims,
            recommendations: dto.noveltyAnalysis.recommendations,
            confidenceScore: dto.noveltyAnalysis.confidenceScore,
            rawLLMResponse: dto.noveltyAnalysis.rawLLMResponse,
          },
          update: {
            summary: dto.noveltyAnalysis.summary,
            novelty: dto.noveltyAnalysis.novelty,
            overlappingClaims: dto.noveltyAnalysis.overlappingClaims,
            recommendations: dto.noveltyAnalysis.recommendations,
            confidenceScore: dto.noveltyAnalysis.confidenceScore,
            rawLLMResponse: dto.noveltyAnalysis.rawLLMResponse,
          },
        });
      }

      return tx.searchHistory.findUnique({
        where: { id: searchId },
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
  async findById(id: string): Promise<any | null> {
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
  async findManyWithFilters(filters: HistoryQueryFilterDto): Promise<{ items: any[]; totalItems: number }> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      startDate,
      endDate,
      query,
      ipc,
      minScore,
      maxScore,
      userId,
    } = filters;

    const where: any = {};

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

    const patentFilters: any = {};
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
  async deleteById(id: string): Promise<boolean> {
    try {
      await this.prisma.searchHistory.delete({
        where: { id },
      });
      return true;
    } catch (err: any) {
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
  async findExistingAnalysis(searchQuery: string, appliedFilters?: Record<string, any> | null): Promise<any | null> {
    const trimmed = searchQuery.trim();
    const where: any = {
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
