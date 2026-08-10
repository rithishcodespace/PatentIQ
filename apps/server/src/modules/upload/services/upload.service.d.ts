import type { IUploadService, IUploadRepository, UploadFileInput, UploadedDocumentRecord } from '../interfaces/upload.interface.js';
export declare class UploadService implements IUploadService {
    private readonly uploadRepository;
    constructor(uploadRepository: IUploadRepository);
    uploadDocument(fileInput: UploadFileInput): Promise<UploadedDocumentRecord>;
    getMetadata(id: string): Promise<UploadedDocumentRecord>;
    deleteDocument(id: string): Promise<boolean>;
}
//# sourceMappingURL=upload.service.d.ts.map