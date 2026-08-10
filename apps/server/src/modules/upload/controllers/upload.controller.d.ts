import type { FastifyRequest, FastifyReply } from 'fastify';
import type { IUploadService } from '../interfaces/upload.interface.js';
import type { IDocumentProcessorService, DirectTextInput } from '../interfaces/upload-processor.interface.js';
import type { IEmbeddingsService } from '../../embeddings/interfaces/embeddings-service.interface.js';
import type { IUploadComparisonService } from '../interfaces/upload-comparison.interface.js';
import type { EmbedDocumentRequestDto, CompareDocumentRequestDto } from '../dto/upload.dto.js';
export declare class UploadController {
    private readonly uploadService;
    private readonly embeddingsService?;
    private readonly uploadComparisonService?;
    private readonly documentProcessorService;
    constructor(uploadService: IUploadService, documentProcessorService?: IDocumentProcessorService, embeddingsService?: IEmbeddingsService | undefined, uploadComparisonService?: IUploadComparisonService | undefined);
    uploadFile(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    processFileUpload(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    processDirectText(request: FastifyRequest<{
        Body: DirectTextInput;
    }>, reply: FastifyReply): Promise<void>;
    embedDocument(request: FastifyRequest<{
        Body: EmbedDocumentRequestDto;
    }>, reply: FastifyReply): Promise<void>;
    compareDocument(request: FastifyRequest<{
        Body: CompareDocumentRequestDto;
    }>, reply: FastifyReply): Promise<void>;
    getMetadata(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
    deleteFile(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=upload.controller.d.ts.map