import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadController } from '../../../src/modules/upload/controllers/upload.controller.js';
import { BadRequestError, NotFoundError } from '../../../src/common/errors/http-errors.js';
import type { UploadedDocumentRecord } from '../../../src/modules/upload/interfaces/upload.interface.js';
import type { StandardPatentDocument } from '../../../src/modules/upload/interfaces/upload-processor.interface.js';

describe('UploadController Unit Tests', () => {
  let uploadController: UploadController;
  let mockUploadService: any;
  let mockDocumentProcessorService: any;
  let mockEmbeddingsService: any;

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

  const mockStandardDoc: StandardPatentDocument = {
    title: 'Wireless Charging Drone',
    abstract: 'Resonant inductive power transfer.',
    claims: '1. A drone receiver.',
    keywords: ['wireless', 'drone'],
    fullText: 'Title: Wireless Charging Drone\n\nAbstract:\nResonant inductive power transfer.',
  };

  beforeEach(() => {
    mockUploadService = {
      uploadDocument: vi.fn().mockResolvedValue(mockRecord),
      getMetadata: vi.fn().mockResolvedValue(mockRecord),
      deleteDocument: vi.fn().mockResolvedValue(true),
    };

    mockDocumentProcessorService = {
      processFile: vi.fn().mockResolvedValue(mockStandardDoc),
      processDirectText: vi.fn().mockResolvedValue(mockStandardDoc),
    };

    mockEmbeddingsService = {
      generatePatentDocumentEmbeddings: vi.fn().mockResolvedValue({
        model: 'nomic-embed-text',
        dimensions: 768,
        sections: ['title', 'abstract', 'claims'],
        generatedAt: '2026-08-02T09:09:22.000Z',
        vectors: {},
      }),
    };

    uploadController = new UploadController(
      mockUploadService,
      mockDocumentProcessorService,
      mockEmbeddingsService
    );
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

  describe('processFileUpload HTTP Handler', () => {
    it('should process uploaded file and return 200 OK with StandardPatentDocument', async () => {
      const mockFileObj = {
        filename: 'invention.pdf',
        mimetype: 'application/pdf',
        toBuffer: vi.fn().mockResolvedValue(Buffer.from('content')),
      };

      const mockRequest: any = {
        file: vi.fn().mockResolvedValue(mockFileObj),
      };

      const mockReply: any = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await uploadController.processFileUpload(mockRequest, mockReply);

      expect(mockDocumentProcessorService.processFile).toHaveBeenCalledWith({
        filename: 'invention.pdf',
        mimetype: 'application/pdf',
        buffer: expect.any(Buffer),
        size: 7,
      });

      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: mockStandardDoc,
      });
    });

    it('should throw BadRequestError if multipart file is missing', async () => {
      const mockRequest: any = {
        file: vi.fn().mockResolvedValue(null),
      };
      const mockReply: any = {};

      await expect(uploadController.processFileUpload(mockRequest, mockReply)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe('processDirectText HTTP Handler', () => {
    it('should process direct JSON invention payload and return 200 OK with StandardPatentDocument', async () => {
      const payload = {
        title: 'Wireless Charging Drone',
        abstract: 'Resonant inductive power transfer.',
        claims: '1. A drone receiver.',
        keywords: ['wireless', 'drone'],
      };

      const mockRequest: any = {
        body: payload,
      };

      const mockReply: any = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await uploadController.processDirectText(mockRequest, mockReply);

      expect(mockDocumentProcessorService.processDirectText).toHaveBeenCalledWith(payload);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: mockStandardDoc,
      });
    });
  });

  describe('embedDocument HTTP Handler', () => {
    it('should generate embeddings for inline standard document and return 200 OK metadata response', async () => {
      const mockRequest: any = {
        body: { document: mockStandardDoc },
      };

      const mockReply: any = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await uploadController.embedDocument(mockRequest, mockReply);

      expect(mockEmbeddingsService.generatePatentDocumentEmbeddings).toHaveBeenCalledWith(mockStandardDoc);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        embedding: {
          model: 'nomic-embed-text',
          dimensions: 768,
          sections: ['title', 'abstract', 'claims'],
          generatedAt: '2026-08-02T09:09:22.000Z',
        },
      });
    });

    it('should throw BadRequestError if neither document nor documentId is provided', async () => {
      const mockRequest: any = { body: {} };
      const mockReply: any = {};

      await expect(uploadController.embedDocument(mockRequest, mockReply)).rejects.toThrow(
        BadRequestError
      );
    });

    it('should throw BadRequestError if embedding service is not configured', async () => {
      const controllerWithoutEmbeddings = new UploadController(
        mockUploadService,
        mockDocumentProcessorService
      );

      const mockRequest: any = { body: { document: mockStandardDoc } };
      const mockReply: any = {};

      await expect(controllerWithoutEmbeddings.embedDocument(mockRequest, mockReply)).rejects.toThrow(
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
