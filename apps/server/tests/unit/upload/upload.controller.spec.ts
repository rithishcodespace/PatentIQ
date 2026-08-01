import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadController } from '../../../src/modules/upload/controllers/upload.controller.js';
import { BadRequestError, NotFoundError } from '../../../src/common/errors/http-errors.js';
import type { UploadedDocumentRecord } from '../../../src/modules/upload/interfaces/upload.interface.js';

describe('UploadController Unit Tests', () => {
  let uploadController: UploadController;
  let mockUploadService: any;

  const mockRecord: UploadedDocumentRecord = {
    id: 'doc-uuid-1234',
    userId: 'usr-1',
    originalFileName: 'Patent.pdf',
    storedFileName: 'doc-uuid-1234.pdf',
    mimeType: 'application/pdf',
    extension: 'pdf',
    size: 51200,
    storagePath: '/secret/path/on/disk/doc-uuid-1234.pdf',
    uploadedAt: new Date('2026-08-01T10:00:00Z'),
    status: 'Uploaded',
  };

  beforeEach(() => {
    mockUploadService = {
      uploadDocument: vi.fn().mockResolvedValue(mockRecord),
      getMetadata: vi.fn().mockResolvedValue(mockRecord),
      deleteDocument: vi.fn().mockResolvedValue(true),
    };

    uploadController = new UploadController(mockUploadService);
  });

  describe('uploadFile HTTP Handler', () => {
    it('should extract file, invoke service, and return 201 Created with document response DTO', async () => {
      const mockFileObj = {
        filename: 'Patent.pdf',
        mimetype: 'application/pdf',
        toBuffer: vi.fn().mockResolvedValue(Buffer.from('PDF')),
      };

      const mockRequest: any = {
        file: vi.fn().mockResolvedValue(mockFileObj),
        user: { id: 'usr-1' },
      };

      const mockReply: any = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await uploadController.uploadFile(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        document: {
          id: 'doc-uuid-1234',
          originalFileName: 'Patent.pdf',
          storedFileName: 'doc-uuid-1234.pdf',
          mimeType: 'application/pdf',
          size: 51200,
          status: 'Uploaded',
        },
      });
    });

    it('should throw BadRequestError if request contains no file', async () => {
      const mockRequest: any = {
        file: vi.fn().mockResolvedValue(null),
      };
      const mockReply: any = {};

      await expect(uploadController.uploadFile(mockRequest, mockReply)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe('getMetadata HTTP Handler', () => {
    it('should return document metadata and status 200 without exposing physical storagePath', async () => {
      const mockRequest: any = {
        params: { id: 'doc-uuid-1234' },
      };

      const mockReply: any = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await uploadController.getMetadata(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        document: {
          id: 'doc-uuid-1234',
          originalFileName: 'Patent.pdf',
          storedFileName: 'doc-uuid-1234.pdf',
          mimeType: 'application/pdf',
          size: 51200,
          status: 'Uploaded',
          uploadedAt: '2026-08-01T10:00:00.000Z',
        },
      });

      // Verify physical storagePath is omitted from output
      const sentPayload = mockReply.send.mock.calls[0][0];
      expect(sentPayload.document.storagePath).toBeUndefined();
    });

    it('should throw BadRequestError if id param is missing', async () => {
      const mockRequest: any = { params: {} };
      const mockReply: any = {};

      await expect(uploadController.getMetadata(mockRequest, mockReply)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe('deleteFile HTTP Handler', () => {
    it('should invoke service deletion and return success response with status 200', async () => {
      const mockRequest: any = {
        params: { id: 'doc-uuid-1234' },
      };

      const mockReply: any = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await uploadController.deleteFile(mockRequest, mockReply);

      expect(mockUploadService.deleteDocument).toHaveBeenCalledWith('doc-uuid-1234');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Document deleted successfully',
      });
    });

    it('should propagate NotFoundError if service fails to find document', async () => {
      mockUploadService.deleteDocument.mockRejectedValueOnce(
        new NotFoundError('Document not found')
      );

      const mockRequest: any = { params: { id: 'invalid-id' } };
      const mockReply: any = {};

      await expect(uploadController.deleteFile(mockRequest, mockReply)).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
