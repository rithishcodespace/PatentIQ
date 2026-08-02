import type { FastifyRequest, FastifyReply } from 'fastify';
import { BadRequestError } from '../../../common/errors/http-errors.js';
import type { IUploadService } from '../interfaces/upload.interface.js';
import type { IDocumentProcessorService, DirectTextInput } from '../interfaces/upload-processor.interface.js';
import type {
  UploadSuccessResponseDto,
  DeleteSuccessResponseDto,
  ProcessDocumentResponseDto,
} from '../dto/upload.dto.js';
import { DocumentProcessorService } from '../services/document-processor.service.js';

export class UploadController {
  private readonly documentProcessorService: IDocumentProcessorService;

  constructor(
    private readonly uploadService: IUploadService,
    documentProcessorService?: IDocumentProcessorService
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
