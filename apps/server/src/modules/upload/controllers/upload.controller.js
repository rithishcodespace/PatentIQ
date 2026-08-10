import fs from 'fs/promises';
import { BadRequestError, NotFoundError } from '../../../common/errors/http-errors.js';
import { DocumentProcessorService } from '../services/document-processor.service.js';
export class UploadController {
    uploadService;
    embeddingsService;
    uploadComparisonService;
    documentProcessorService;
    constructor(uploadService, documentProcessorService, embeddingsService, uploadComparisonService) {
        this.uploadService = uploadService;
        this.embeddingsService = embeddingsService;
        this.uploadComparisonService = uploadComparisonService;
        this.documentProcessorService = documentProcessorService || new DocumentProcessorService();
    }
    async uploadFile(request, reply) {
        const data = await request.file();
        if (!data) {
            throw new BadRequestError('No file uploaded in multipart request.');
        }
        const buffer = await data.toBuffer();
        const userId = request.user?.id || undefined;
        const documentRecord = await this.uploadService.uploadDocument({
            filename: data.filename,
            mimetype: data.mimetype,
            buffer,
            userId,
        });
        const responseDto = {
            success: true,
            document: {
                id: documentRecord.id,
                originalFileName: documentRecord.originalFileName,
                storedFileName: documentRecord.storedFileName,
                mimeType: documentRecord.mimeType,
                size: documentRecord.size,
                status: documentRecord.status,
            },
        };
        reply.status(201).send(responseDto);
    }
    async processFileUpload(request, reply) {
        const data = await request.file();
        if (!data) {
            throw new BadRequestError('No file uploaded in multipart request. Please provide a PDF, DOCX, or TXT document.');
        }
        const buffer = await data.toBuffer();
        const processedDocument = await this.documentProcessorService.processFile({
            filename: data.filename,
            mimetype: data.mimetype,
            buffer,
            size: buffer.length,
        });
        const responseDto = {
            success: true,
            data: processedDocument,
        };
        reply.status(200).send(responseDto);
    }
    async processDirectText(request, reply) {
        const body = request.body;
        const processedDocument = await this.documentProcessorService.processDirectText(body);
        const responseDto = {
            success: true,
            data: processedDocument,
        };
        reply.status(200).send(responseDto);
    }
    async embedDocument(request, reply) {
        if (!this.embeddingsService) {
            throw new BadRequestError('Embedding service is not configured.');
        }
        const body = request.body || {};
        let targetDoc = body.document;
        // If document ID was supplied, fetch stored document and extract text
        if (!targetDoc && body.documentId) {
            const record = await this.uploadService.getMetadata(body.documentId);
            if (!record) {
                throw new NotFoundError(`Uploaded document with ID '${body.documentId}' not found.`);
            }
            try {
                const fileBuffer = await fs.readFile(record.storagePath);
                targetDoc = await this.documentProcessorService.processFile({
                    filename: record.originalFileName,
                    mimetype: record.mimeType,
                    buffer: fileBuffer,
                    size: record.size,
                });
            }
            catch (err) {
                if (err instanceof NotFoundError || err instanceof BadRequestError)
                    throw err;
                throw new BadRequestError(`Failed to read document file from disk: ${err.message}`);
            }
        }
        if (!targetDoc) {
            throw new BadRequestError('Must provide either a processed document object or a valid documentId in request body.');
        }
        const result = await this.embeddingsService.generatePatentDocumentEmbeddings(targetDoc);
        const responseDto = {
            success: true,
            embedding: {
                model: result.model,
                dimensions: result.dimensions,
                sections: result.sections,
                generatedAt: result.generatedAt,
            },
        };
        reply.status(200).send(responseDto);
    }
    async compareDocument(request, reply) {
        if (!this.uploadComparisonService) {
            throw new BadRequestError('Upload comparison service is not configured.');
        }
        const responseDto = await this.uploadComparisonService.compareDocument(request.body);
        reply.status(200).send(responseDto);
    }
    async getMetadata(request, reply) {
        const { id } = request.params;
        if (!id) {
            throw new BadRequestError('Document ID is required.');
        }
        const documentRecord = await this.uploadService.getMetadata(id);
        const responseDto = {
            success: true,
            document: {
                id: documentRecord.id,
                originalFileName: documentRecord.originalFileName,
                storedFileName: documentRecord.storedFileName,
                mimeType: documentRecord.mimeType,
                size: documentRecord.size,
                status: documentRecord.status,
                uploadedAt: documentRecord.uploadedAt.toISOString(),
            },
        };
        reply.status(200).send(responseDto);
    }
    async deleteFile(request, reply) {
        const { id } = request.params;
        if (!id) {
            throw new BadRequestError('Document ID is required.');
        }
        await this.uploadService.deleteDocument(id);
        const responseDto = {
            success: true,
            message: 'Document deleted successfully',
        };
        reply.status(200).send(responseDto);
    }
}
//# sourceMappingURL=upload.controller.js.map