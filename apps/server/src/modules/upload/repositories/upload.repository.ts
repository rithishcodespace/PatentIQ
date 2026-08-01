import { PrismaClient } from '@prisma/client';
import type {
  IUploadRepository,
  UploadedDocumentRecord,
  UploadStatus,
} from '../interfaces/upload.interface.js';

export class UploadRepository implements IUploadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private get db(): any {
    return this.prisma;
  }

  async create(data: Omit<UploadedDocumentRecord, 'id' | 'uploadedAt'>): Promise<UploadedDocumentRecord> {
    const record = await this.db.uploadedDocument.create({
      data: {
        userId: data.userId || null,
        originalFileName: data.originalFileName,
        storedFileName: data.storedFileName,
        mimeType: data.mimeType,
        extension: data.extension,
        size: data.size,
        storagePath: data.storagePath,
        status: data.status || 'Uploaded',
      },
    });
    return record as UploadedDocumentRecord;
  }

  async findById(id: string): Promise<UploadedDocumentRecord | null> {
    const record = await this.db.uploadedDocument.findUnique({
      where: { id },
    });
    return record as UploadedDocumentRecord | null;
  }

  async deleteById(id: string): Promise<UploadedDocumentRecord | null> {
    try {
      const record = await this.db.uploadedDocument.delete({
        where: { id },
      });
      return record as UploadedDocumentRecord;
    } catch {
      return null;
    }
  }

  async updateStatus(id: string, status: UploadStatus): Promise<UploadedDocumentRecord> {
    const record = await this.db.uploadedDocument.update({
      where: { id },
      data: { status },
    });
    return record as UploadedDocumentRecord;
  }
}
