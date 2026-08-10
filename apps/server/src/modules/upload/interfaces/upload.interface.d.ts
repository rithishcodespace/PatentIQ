export type UploadStatus = 'Uploaded' | 'Processing' | 'Completed' | 'Failed';
export interface UploadedDocumentRecord {
    id: string;
    userId?: string | null;
    originalFileName: string;
    storedFileName: string;
    mimeType: string;
    extension: string;
    size: number;
    storagePath: string;
    uploadedAt: Date;
    status: UploadStatus;
}
export interface UploadFileInput {
    filename: string;
    mimetype: string;
    buffer: Buffer;
    userId?: string;
}
export interface IUploadRepository {
    create(data: Omit<UploadedDocumentRecord, 'id' | 'uploadedAt'>): Promise<UploadedDocumentRecord>;
    findById(id: string): Promise<UploadedDocumentRecord | null>;
    deleteById(id: string): Promise<UploadedDocumentRecord | null>;
    updateStatus(id: string, status: UploadStatus): Promise<UploadedDocumentRecord>;
}
export interface IUploadService {
    uploadDocument(fileInput: UploadFileInput): Promise<UploadedDocumentRecord>;
    getMetadata(id: string): Promise<UploadedDocumentRecord>;
    deleteDocument(id: string): Promise<boolean>;
}
//# sourceMappingURL=upload.interface.d.ts.map