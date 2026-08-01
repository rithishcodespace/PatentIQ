import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import { UploadService } from '../../../src/modules/upload/services/upload.service.js';
import {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} from '../../../src/common/errors/http-errors.js';
import type { UploadedDocumentRecord } from '../../../src/modules/upload/interfaces/upload.interface.js';

describe('UploadService Unit Tests', () => {
  let uploadService: UploadService;
  let mockUploadRepository: any;

  const sampleDocRecord: UploadedDocumentRecord = {
    id: 'doc-uuid-1234-5678',
    userId: 'usr-999',
    originalFileName: 'Patent_Application.pdf',
    storedFileName: 'doc-uuid-1234-5678.pdf',
    mimeType: 'application/pdf',
    extension: 'pdf',
    size: 1024,
    storagePath: '/mock/storage/uploads/pdf/doc-uuid-1234-5678.pdf',
    uploadedAt: new Date('2026-08-01T12:00:00Z'),
    status: 'Uploaded',
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined as any);
    vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined as any);
    vi.spyOn(fs, 'unlink').mockResolvedValue(undefined as any);

    mockUploadRepository = {
      create: vi.fn().mockResolvedValue(sampleDocRecord),
      findById: vi.fn().mockResolvedValue(sampleDocRecord),
      deleteById: vi.fn().mockResolvedValue(sampleDocRecord),
      updateStatus: vi.fn().mockResolvedValue(sampleDocRecord),
    };

    uploadService = new UploadService(mockUploadRepository);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful Document Uploads', () => {
    it('should successfully process and save a valid PDF document', async () => {
      const pdfBuffer = Buffer.from('PDF_DUMMY_CONTENT');
      const result = await uploadService.uploadDocument({
        filename: 'Patent_Application.pdf',
        mimetype: 'application/pdf',
        buffer: pdfBuffer,
        userId: 'usr-999',
      });

      expect(result).toEqual(sampleDocRecord);
      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(mockUploadRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          originalFileName: 'Patent_Application.pdf',
          mimeType: 'application/pdf',
          extension: 'pdf',
          size: pdfBuffer.length,
          status: 'Uploaded',
        })
      );
    });

    it('should successfully upload a valid DOCX document', async () => {
      const docxBuffer = Buffer.from('DOCX_CONTENT');
      const docxRecord: UploadedDocumentRecord = {
        ...sampleDocRecord,
        originalFileName: 'Claims.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extension: 'docx',
      };
      mockUploadRepository.create.mockResolvedValueOnce(docxRecord);

      const result = await uploadService.uploadDocument({
        filename: 'Claims.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: docxBuffer,
      });

      expect(result.extension).toBe('docx');
      expect(result.mimeType).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
    });

    it('should successfully upload a valid TXT document', async () => {
      const txtBuffer = Buffer.from('TXT_CONTENT');
      const txtRecord: UploadedDocumentRecord = {
        ...sampleDocRecord,
        originalFileName: 'PriorArt.txt',
        mimeType: 'text/plain',
        extension: 'txt',
      };
      mockUploadRepository.create.mockResolvedValueOnce(txtRecord);

      const result = await uploadService.uploadDocument({
        filename: 'PriorArt.txt',
        mimetype: 'text/plain',
        buffer: txtBuffer,
      });

      expect(result.extension).toBe('txt');
      expect(result.mimeType).toBe('text/plain');
    });
  });

  describe('Validation Failures', () => {
    it('should throw BadRequestError when payload or file buffer is missing', async () => {
      await expect(uploadService.uploadDocument(null as any)).rejects.toThrow(BadRequestError);
      await expect(
        uploadService.uploadDocument({ filename: 'test.pdf', mimetype: 'application/pdf', buffer: null as any })
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError for empty (0 bytes) file', async () => {
      const emptyBuffer = Buffer.alloc(0);
      await expect(
        uploadService.uploadDocument({
          filename: 'empty.pdf',
          mimetype: 'application/pdf',
          buffer: emptyBuffer,
        })
      ).rejects.toThrow('Uploaded file is empty (0 bytes).');
    });

    it('should throw BadRequestError for unsupported MIME types (e.g. image/png)', async () => {
      await expect(
        uploadService.uploadDocument({
          filename: 'image.png',
          mimetype: 'image/png',
          buffer: Buffer.from('IMAGE'),
        })
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if file extension does not match MIME type', async () => {
      await expect(
        uploadService.uploadDocument({
          filename: 'document.txt',
          mimetype: 'application/pdf',
          buffer: Buffer.from('CONTENT'),
        })
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError when file size exceeds 20 MB', async () => {
      const oversizedBuffer = Buffer.alloc(21 * 1024 * 1024);
      await expect(
        uploadService.uploadDocument({
          filename: 'huge.pdf',
          mimetype: 'application/pdf',
          buffer: oversizedBuffer,
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('Storage & Database Failures', () => {
    it('should throw InternalServerError when disk write fails', async () => {
      vi.spyOn(fs, 'writeFile').mockRejectedValueOnce(new Error('Disk full'));

      await expect(
        uploadService.uploadDocument({
          filename: 'sample.pdf',
          mimetype: 'application/pdf',
          buffer: Buffer.from('TEST'),
        })
      ).rejects.toThrow(InternalServerError);
    });

    it('should clean up orphaned disk file if database insertion fails', async () => {
      mockUploadRepository.create.mockRejectedValueOnce(new Error('DB failure'));

      await expect(
        uploadService.uploadDocument({
          filename: 'sample.pdf',
          mimetype: 'application/pdf',
          buffer: Buffer.from('TEST'),
        })
      ).rejects.toThrow(InternalServerError);

      expect(fs.unlink).toHaveBeenCalled();
    });
  });

  describe('Retrieve Metadata', () => {
    it('should return document metadata when valid ID is provided', async () => {
      const doc = await uploadService.getMetadata('doc-uuid-1234-5678');
      expect(doc).toEqual(sampleDocRecord);
      expect(mockUploadRepository.findById).toHaveBeenCalledWith('doc-uuid-1234-5678');
    });

    it('should throw NotFoundError if document ID does not exist', async () => {
      mockUploadRepository.findById.mockResolvedValueOnce(null);

      await expect(uploadService.getMetadata('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('Delete Document', () => {
    it('should successfully delete document from database and filesystem', async () => {
      const result = await uploadService.deleteDocument('doc-uuid-1234-5678');

      expect(result).toBe(true);
      expect(mockUploadRepository.deleteById).toHaveBeenCalledWith('doc-uuid-1234-5678');
      expect(fs.unlink).toHaveBeenCalledWith(sampleDocRecord.storagePath);
    });

    it('should handle missing disk file gracefully during deletion', async () => {
      const enoentErr = new Error('File not found') as any;
      enoentErr.code = 'ENOENT';
      vi.spyOn(fs, 'unlink').mockRejectedValueOnce(enoentErr);

      const result = await uploadService.deleteDocument('doc-uuid-1234-5678');

      expect(result).toBe(true);
      expect(mockUploadRepository.deleteById).toHaveBeenCalledWith('doc-uuid-1234-5678');
    });

    it('should throw NotFoundError if document to delete is not in DB', async () => {
      mockUploadRepository.findById.mockResolvedValueOnce(null);

      await expect(uploadService.deleteDocument('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });
});
