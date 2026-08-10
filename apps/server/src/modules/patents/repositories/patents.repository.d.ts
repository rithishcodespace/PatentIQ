import { PrismaClient } from '@prisma/client';
import type { CleanedPatentRecord } from '../types/patent.types.js';
export interface PatentFilterOptions {
    searchQuery?: string | undefined;
    query?: string | undefined;
    ipc?: string | undefined;
    patentNumber?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}
export declare class PatentsRepository {
    private prisma;
    constructor(prisma?: PrismaClient);
    /**
     * Maps Prisma Patent record to CleanedPatentRecord application interface.
     */
    private mapToRecord;
    /**
     * Find a patent record by unique ID.
     */
    findById(id: string): Promise<CleanedPatentRecord | null>;
    /**
     * Find a patent record by unique patent number.
     */
    findByPatentNumber(patentNumber: string): Promise<CleanedPatentRecord | null>;
    /**
     * List patent records with optional filters.
     */
    listWithFilters(filters?: PatentFilterOptions): Promise<CleanedPatentRecord[]>;
    /**
     * Alias for listWithFilters.
     */
    list(filters?: PatentFilterOptions): Promise<CleanedPatentRecord[]>;
    /**
     * Insert a new patent record.
     */
    insert(data: Partial<CleanedPatentRecord>): Promise<CleanedPatentRecord>;
    /**
     * Alias for insert.
     */
    create(data: Partial<CleanedPatentRecord>): Promise<CleanedPatentRecord>;
}
//# sourceMappingURL=patents.repository.d.ts.map