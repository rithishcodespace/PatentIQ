import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentProcessorService } from '../../../src/modules/upload/services/document-processor.service.js';
import { BadRequestError, UnprocessableEntityError } from '../../../src/common/errors/http-errors.js';
describe('DocumentProcessorService Unit Tests', () => {
    let service;
    let mockPdfParser;
    let mockDocxParser;
    let mockTxtParser;
    beforeEach(() => {
        mockPdfParser = {
            parse: vi.fn().mockResolvedValue({
                title: 'PDF Patent Title',
                bodyText: 'Title: PDF Patent Title\n\nAbstract: PDF abstract content.\n\nClaims: 1. A PDF claim.',
            }),
        };
        mockDocxParser = {
            parse: vi.fn().mockResolvedValue({
                bodyText: 'Title: DOCX Patent Title\n\nAbstract: DOCX abstract content.\n\nClaims: 1. A DOCX claim.',
            }),
        };
        mockTxtParser = {
            parse: vi.fn().mockResolvedValue({
                bodyText: 'Title: TXT Patent Title\n\nAbstract: TXT abstract content.\n\nClaims: 1. A TXT claim.',
            }),
        };
        service = new DocumentProcessorService(mockPdfParser, mockDocxParser, mockTxtParser);
    });
    describe('processFile', () => {
        it('should route PDF file to PdfParser and return StandardPatentDocument', async () => {
            const input = {
                filename: 'patent.pdf',
                mimetype: 'application/pdf',
                buffer: Buffer.from('pdf data'),
                size: 100,
            };
            const result = await service.processFile(input);
            expect(mockPdfParser.parse).toHaveBeenCalled();
            expect(result.title).toBe('PDF Patent Title');
            expect(result.abstract).toBe('PDF abstract content.');
            expect(result.claims).toBe('1. A PDF claim.');
            expect(result.fullText).toBeDefined();
        });
        it('should route DOCX file to DocxParser and return StandardPatentDocument', async () => {
            const input = {
                filename: 'patent.docx',
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                buffer: Buffer.from('docx data'),
                size: 100,
            };
            const result = await service.processFile(input);
            expect(mockDocxParser.parse).toHaveBeenCalled();
            expect(result.title).toBe('DOCX Patent Title');
            expect(result.abstract).toBe('DOCX abstract content.');
            expect(result.claims).toBe('1. A DOCX claim.');
        });
        it('should route TXT file to TxtParser and return StandardPatentDocument', async () => {
            const input = {
                filename: 'patent.txt',
                mimetype: 'text/plain',
                buffer: Buffer.from('txt data'),
                size: 100,
            };
            const result = await service.processFile(input);
            expect(mockTxtParser.parse).toHaveBeenCalled();
            expect(result.title).toBe('TXT Patent Title');
        });
        it('should throw UnprocessableEntityError on unsupported file formats', async () => {
            const input = {
                filename: 'image.png',
                mimetype: 'image/png',
                buffer: Buffer.from('png data'),
                size: 100,
            };
            await expect(service.processFile(input)).rejects.toThrow(UnprocessableEntityError);
        });
        it('should throw BadRequestError if file size exceeds maximum 20MB limit', async () => {
            const input = {
                filename: 'large.pdf',
                mimetype: 'application/pdf',
                buffer: Buffer.from('data'),
                size: 25 * 1024 * 1024,
            };
            await expect(service.processFile(input)).rejects.toThrow('File size exceeds maximum allowed limit');
        });
        it('should throw BadRequestError on empty buffer', async () => {
            const input = {
                filename: 'empty.pdf',
                mimetype: 'application/pdf',
                buffer: Buffer.alloc(0),
                size: 0,
            };
            await expect(service.processFile(input)).rejects.toThrow('Uploaded file is empty');
        });
        it('should throw BadRequestError on extremely short extracted text', async () => {
            mockTxtParser.parse.mockResolvedValueOnce({ bodyText: 'Short' });
            const input = {
                filename: 'short.txt',
                mimetype: 'text/plain',
                buffer: Buffer.from('Short'),
                size: 5,
            };
            await expect(service.processFile(input)).rejects.toThrow('extremely short');
        });
    });
    describe('processDirectText', () => {
        it('should process direct JSON text input and return StandardPatentDocument', async () => {
            const input = {
                title: 'Wireless Charging Drone',
                abstract: 'An autonomous drone with inductive charging.',
                claims: '1. A drone receiver coil system.',
                keywords: ['wireless', 'drone', 'charging'],
            };
            const result = await service.processDirectText(input);
            expect(result.title).toBe('Wireless Charging Drone');
            expect(result.abstract).toBe('An autonomous drone with inductive charging.');
            expect(result.claims).toBe('1. A drone receiver coil system.');
            expect(result.keywords).toEqual(['wireless', 'drone', 'charging']);
            expect(result.fullText).toContain('Title: Wireless Charging Drone');
        });
        it('should throw BadRequestError if title is missing', async () => {
            const input = {
                title: '',
                abstract: 'Valid abstract',
                claims: 'Valid claims',
            };
            await expect(service.processDirectText(input)).rejects.toThrow('Patent title is required');
        });
        it('should throw BadRequestError if abstract is missing', async () => {
            const input = {
                title: 'Valid Title',
                abstract: '   ',
                claims: 'Valid claims',
            };
            await expect(service.processDirectText(input)).rejects.toThrow('Patent abstract is required');
        });
        it('should throw BadRequestError if claims are missing', async () => {
            const input = {
                title: 'Valid Title',
                abstract: 'Valid abstract',
                claims: '',
            };
            await expect(service.processDirectText(input)).rejects.toThrow('Patent claims');
        });
        it('should throw BadRequestError if total text is extremely short', async () => {
            const input = {
                title: 'a',
                abstract: 'b',
                claims: 'c',
            };
            await expect(service.processDirectText(input)).rejects.toThrow('extremely short');
        });
    });
});
//# sourceMappingURL=document-processor.service.test.js.map