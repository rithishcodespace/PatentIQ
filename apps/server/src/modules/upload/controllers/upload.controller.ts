import type { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import { BadRequestError, NotFoundError } from '../../../common/errors/http-errors.js';
import type { IUploadService } from '../interfaces/upload.interface.js';
import type { IDocumentProcessorService, DirectTextInput, StandardPatentDocument } from '../interfaces/upload-processor.interface.js';
import type { IEmbeddingsService } from '../../embeddings/interfaces/embeddings-service.interface.js';
import type {
  UploadSuccessResponseDto,
  DeleteSuccessResponseDto,
  ProcessDocumentResponseDto,
  EmbedDocumentRequestDto,
  EmbedDocumentResponseDto,
} from '../dto/upload.dto.js';
import { DocumentProcessorService } from '../services/document-processor.service.js';

export class UploadController {
  private readonly documentProcessorService: IDocumentProcessorService;

  constructor(
    private readonly uploadService: IUploadService,
    documentProcessorService?: IDocumentProcessorService,
    private readonly embeddingsService?: IEmbeddingsService
  ) {
    this.documentProcessorService = documentProcessorService || new DocumentProcessorService();
  }

  async uploadFile(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = await request.file();
    if (!data) {
      throw new BadRequestError('No file uploaded in multipart request.');
    }

    const buffer = await data.toBuffer();
    const userId = (request.user as any)?.id || undefined;

    const documentRecord = await this.uploadService.uploadDocument({
      filename: data.filename,
      mimetype: data.mimetype,
      buffer,
      userId,
    });

    const responseDto: UploadSuccessResponseDto = {
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

  async processFileUpload(request: FastifyRequest, reply: FastifyReply): Promise<void> {
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

    const responseDto: ProcessDocumentResponseDto = {
      success: true,
      data: processedDocument,
    };

    reply.status(200).send(responseDto);
  }

  async processDirectText(
    request: FastifyRequest<{ Body: DirectTextInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const body = request.body;
    const processedDocument = await this.documentProcessorService.processDirectText(body);

    const responseDto: ProcessDocumentResponseDto = {
      success: true,
      data: processedDocument,
    };

    reply.status(200).send(responseDto);
  }

  async embedDocument(
    request: FastifyRequest<{ Body: EmbedDocumentRequestDto }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!this.embeddingsService) {
      throw new BadRequestError('Embedding service is not configured.');
    }

    const body = request.body || {};
    let targetDoc: StandardPatentDocument | undefined = body.document;

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
      } catch (err: any) {
        if (err instanceof NotFoundError || err instanceof BadRequestError) throw err;
        throw new BadRequestError(`Failed to read document file from disk: ${err.message}`);
      }
    }

    if (!targetDoc) {
      throw new BadRequestError('Must provide either a processed document object or a valid documentId in request body.');
    }

    const result = await this.embeddingsService.generatePatentDocumentEmbeddings(targetDoc);

    const responseDto: EmbedDocumentResponseDto = {
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

  async getMetadata(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
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

  async deleteFile(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    if (!id) {
      throw new BadRequestError('Document ID is required.');
    }

    await this.uploadService.deleteDocument(id);

    const responseDto: DeleteSuccessResponseDto = {
      success: true,
      message: 'Document deleted successfully',
    };

    reply.status(200).send(responseDto);
  }
}
