import { PrismaClient, type Patent } from '@prisma/client';
import type { CleanedPatentRecord } from '../types/patent.types.js';

export interface PatentFilterOptions {
  searchQuery?: string | undefined;
  query?: string | undefined;
  ipc?: string | undefined;
  patentNumber?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export class PatentsRepository {
<<<<<<< HEAD
<<<<<<< HEAD
  constructor() {
    // TODO: Inject PrismaClient dependency
=======
=======
>>>>>>> feature/backend
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
<<<<<<< HEAD
>>>>>>> 9e9cce8 (feat: implemented real aggregated search metrics, execution times and query distribution queries agains postgrsql and redis)
=======
>>>>>>> feature/backend
  }

  /**
   * Maps Prisma Patent record to CleanedPatentRecord application interface.
   */
  private mapToRecord(patent: Patent): CleanedPatentRecord {
    return {
      id: patent.id,
      patentNumber: patent.patentNumber,
      title: patent.title,
      abstract: patent.abstract,
      claims: patent.claims,
      ipcClassifications: patent.ipcClassifications,
      description: patent.description ?? undefined,
      filingDate: patent.filingDate ?? undefined,
      grantDate: patent.grantDate ?? undefined,
      inventors: patent.inventors.length > 0 ? patent.inventors : undefined,
      assignee: patent.assignee ?? undefined,
      cleanedAt: patent.cleanedAt,
    };
  }

  /**
   * Find a patent record by unique ID.
   */
  async findById(id: string): Promise<CleanedPatentRecord | null> {
    const patent = await this.prisma.patent.findUnique({
      where: { id },
    });
    return patent ? this.mapToRecord(patent) : null;
  }

  /**
   * Find a patent record by unique patent number.
   */
  async findByPatentNumber(patentNumber: string): Promise<CleanedPatentRecord | null> {
    const patent = await this.prisma.patent.findUnique({
      where: { patentNumber },
    });
    return patent ? this.mapToRecord(patent) : null;
  }

  /**
   * List patent records with optional filters (searchQuery, query, ipc, limit, offset).
   */
  async listWithFilters(filters?: PatentFilterOptions): Promise<CleanedPatentRecord[]> {
    const whereClause: any = {};
    const queryText = filters?.searchQuery || filters?.query;

    if (queryText) {
      whereClause.OR = [
        { title: { contains: queryText, mode: 'insensitive' } },
        { abstract: { contains: queryText, mode: 'insensitive' } },
      ];
    }

    if (filters?.ipc) {
      whereClause.ipcClassifications = {
        has: filters.ipc,
      };
    }

    if (filters?.patentNumber) {
      whereClause.patentNumber = {
        contains: filters.patentNumber,
        mode: 'insensitive',
      };
    }

    const patents = await this.prisma.patent.findMany({
      where: whereClause,
      take: filters?.limit ?? 50,
      skip: filters?.offset ?? 0,
      orderBy: { createdAt: 'desc' },
    });

    return patents.map((p) => this.mapToRecord(p));
  }

  /**
   * Alias for listWithFilters.
   */
  async list(filters?: PatentFilterOptions): Promise<CleanedPatentRecord[]> {
    return this.listWithFilters(filters);
  }

  /**
   * Insert a new patent record into PostgreSQL database via Prisma.
   */
  async insert(data: Partial<CleanedPatentRecord>): Promise<CleanedPatentRecord> {
    const patentNumber = data.patentNumber || `PAT-${Date.now()}`;
    const title = data.title || 'Untitled Patent Document';
    const abstract = data.abstract || '';
    const claims = data.claims || [];
    const ipcClassifications = data.ipcClassifications || [];

    const patent = await this.prisma.patent.create({
      data: {
        patentNumber,
        title,
        abstract,
        claims,
        ipcClassifications,
        description: data.description ?? null,
        filingDate: data.filingDate ?? null,
        grantDate: data.grantDate ?? null,
        inventors: data.inventors || [],
        assignee: data.assignee ?? null,
        cleanedAt: data.cleanedAt || new Date(),
      },
    });

    return this.mapToRecord(patent);
  }

  /**
   * Alias for insert.
   */
  async create(data: Partial<CleanedPatentRecord>): Promise<CleanedPatentRecord> {
    return this.insert(data);
  }
}
