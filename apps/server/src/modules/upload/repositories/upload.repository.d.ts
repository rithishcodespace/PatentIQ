import { PrismaClient } from '@prisma/client';
import type { IUploadRepository, UploadedDocumentRecord, UploadStatus } from '../interfaces/upload.interface.js';
export declare class UploadRepository implements IUploadRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private get db();
    create(data: Omit<UploadedDocumentRecord, 'id' | 'uploadedAt'>): Promise<UploadedDocumentRecord>;
    findById(id: string): Promise<UploadedDocumentRecord | null>;
    deleteById(id: string): Promise<UploadedDocumentRecord | null>;
    updateStatus(id: string, status: UploadStatus): Promise<UploadedDocumentRecord>;
}
//# sourceMappingURL=upload.repository.d.ts.map