import type { FastifyRequest, FastifyReply } from 'fastify';
import { BadRequestError } from '../../../common/errors/http-errors.js';
import type { IUploadService } from '../interfaces/upload.interface.js';
import type {
  UploadSuccessResponseDto,
  DocumentResponseDto,
  DeleteSuccessResponseDto,
} from '../dto/upload.dto.js';

export class UploadController {
  constructor(private readonly uploadService: IUploadService) {}

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
