import { PrismaClient } from '@prisma/client';
export class PatentsRepository {
    prisma;
    constructor(prisma) {
        if (!prisma && !process.env.DATABASE_URL) {
            process.env.DATABASE_URL =
                'postgresql://postgres:postgres@localhost:5432/patent_iq';
        }
        this.prisma = prisma || new PrismaClient();
    }
    /**
     * Maps Prisma Patent record to CleanedPatentRecord application interface.
     */
    mapToRecord(patent) {
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
    async findById(id) {
        const patent = await this.prisma.patent.findUnique({
            where: { id },
        });
        return patent ? this.mapToRecord(patent) : null;
    }
    /**
     * Find a patent record by unique patent number.
     */
    async findByPatentNumber(patentNumber) {
        const patent = await this.prisma.patent.findUnique({
            where: { patentNumber },
        });
        return patent ? this.mapToRecord(patent) : null;
    }
    /**
     * List patent records with optional filters.
     */
    async listWithFilters(filters) {
        const whereClause = {};
        const queryText = filters?.searchQuery || filters?.query;
        if (queryText) {
            whereClause.OR = [
                {
                    title: {
                        contains: queryText,
                        mode: 'insensitive',
                    },
                },
                {
                    abstract: {
                        contains: queryText,
                        mode: 'insensitive',
                    },
                },
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
            orderBy: {
                createdAt: 'desc',
            },
        });
        return patents.map((patent) => this.mapToRecord(patent));
    }
    /**
     * Alias for listWithFilters.
     */
    async list(filters) {
        return this.listWithFilters(filters);
    }
    /**
     * Insert a new patent record.
     */
    async insert(data) {
        const patent = await this.prisma.patent.create({
            data: {
                patentNumber: data.patentNumber ?? `PAT-${Date.now()}`,
                title: data.title ?? 'Untitled Patent Document',
                abstract: data.abstract ?? '',
                claims: data.claims ?? [],
                ipcClassifications: data.ipcClassifications ?? [],
                description: data.description ?? null,
                filingDate: data.filingDate ?? null,
                grantDate: data.grantDate ?? null,
                inventors: data.inventors ?? [],
                assignee: data.assignee ?? null,
                cleanedAt: data.cleanedAt ?? new Date(),
            },
        });
        return this.mapToRecord(patent);
    }
    /**
     * Alias for insert.
     */
    async create(data) {
        return this.insert(data);
    }
}
//# sourceMappingURL=patents.repository.js.map