import { describe, it, expect, vi } from 'vitest';
import { DocxParser } from '../../../src/modules/upload/parsers/docx.parser.js';
import { BadRequestError } from '../../../src/common/errors/http-errors.js';
vi.mock('mammoth', () => {
    return {
        default: {
            extractRawText: vi.fn(async ({ buffer }) => {
                const content = buffer.toString('utf-8');
                if (content.includes('CORRUPTED')) {
                    throw new Error('Can not find end of central directory');
                }
                if (content.includes('EMPTY')) {
                    return { value: '', messages: [] };
                }
                return {
                    value: 'Title: Drone Navigation System\n\nAbstract: Autonomous drone flight path control.',
                    messages: [],
                };
            }),
        },
    };
});
describe('DocxParser Unit Tests', () => {
    const parser = new DocxParser();
    it('should successfully parse clean raw text from DOCX buffer', async () => {
        const buffer = Buffer.from('VALID_DOCX');
        const result = await parser.parse(buffer);
        expect(result.bodyText).toContain('Drone Navigation System');
        expect(result.metadata).toBeDefined();
    });
    it('should throw BadRequestError on empty buffer', async () => {
        await expect(parser.parse(Buffer.alloc(0))).rejects.toThrow(BadRequestError);
    });
    it('should throw BadRequestError when DOCX yields empty text', async () => {
        const buffer = Buffer.from('EMPTY_DOCX');
        await expect(parser.parse(buffer)).rejects.toThrow('DOCX contains no readable text');
    });
    it('should throw BadRequestError on corrupted DOCX file', async () => {
        const buffer = Buffer.from('CORRUPTED_DOCX');
        await expect(parser.parse(buffer)).rejects.toThrow('Corrupted or invalid DOCX file');
    });
});
//# sourceMappingURL=docx.parser.test.js.map