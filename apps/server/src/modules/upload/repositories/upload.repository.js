import { PrismaClient } from '@prisma/client';
export class UploadRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() {
        return this.prisma;
    }
    async create(data) {
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
        return record;
    }
    async findById(id) {
        const record = await this.db.uploadedDocument.findUnique({
            where: { id },
        });
        return record;
    }
    async deleteById(id) {
        try {
            const record = await this.db.uploadedDocument.delete({
                where: { id },
            });
            return record;
        }
        catch {
            return null;
        }
    }
    async updateStatus(id, status) {
        const record = await this.db.uploadedDocument.update({
            where: { id },
            data: { status },
        });
        return record;
    }
}
//# sourceMappingURL=upload.repository.js.map