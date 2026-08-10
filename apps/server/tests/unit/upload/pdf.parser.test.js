import { describe, it, expect, vi } from 'vitest';
import { PdfParser } from '../../../src/modules/upload/parsers/pdf.parser.js';
import { BadRequestError } from '../../../src/common/errors/http-errors.js';
// Mock pdf-parse library
vi.mock('pdf-parse', () => {
    return {
        default: vi.fn(async (buffer) => {
            const content = buffer.toString('utf-8');
            if (content.includes('CORRUPTED')) {
                throw new Error('Invalid PDF structure');
            }
            if (content.includes('EMPTY')) {
                return { text: '', numpages: 1, info: {} };
            }
            return {
                text: 'Title: Wireless Power Transfer\n\nAbstract: Inductive charging for drones.',
                numpages: 2,
                info: { Title: 'Wireless Power Transfer' },
            };
        }),
    };
});
describe('PdfParser Unit Tests', () => {
    const parser = new PdfParser();
    it('should successfully parse valid PDF buffer and return title, bodyText, and metadata', async () => {
        const buffer = Buffer.from('VALID_PDF_CONTENT');
        const result = await parser.parse(buffer);
        expect(result.bodyText).toContain('Wireless Power Transfer');
        expect(result.title).toBe('Wireless Power Transfer');
        expect(result.metadata).toEqual({
            numPages: 2,
            info: { Title: 'Wireless Power Transfer' },
        });
    });
    it('should throw BadRequestError when buffer is empty', async () => {
        await expect(parser.parse(Buffer.alloc(0))).rejects.toThrow(BadRequestError);
    });
    it('should throw BadRequestError when PDF contains no readable text', async () => {
        const buffer = Buffer.from('EMPTY_PDF_CONTENT');
        await expect(parser.parse(buffer)).rejects.toThrow('PDF contains no readable text');
    });
    it('should throw BadRequestError when PDF is corrupted or invalid', async () => {
        const buffer = Buffer.from('CORRUPTED_PDF_CONTENT');
        await expect(parser.parse(buffer)).rejects.toThrow('Corrupted or invalid PDF file');
    });
});
//# sourceMappingURL=pdf.parser.test.js.map