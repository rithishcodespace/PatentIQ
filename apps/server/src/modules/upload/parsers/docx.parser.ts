import mammoth from 'mammoth';
import { BadRequestError } from '../../../common/errors/http-errors.js';
import type { IDocumentParser, ParsedDocumentResult } from '../interfaces/upload-processor.interface.js';

export class DocxParser implements IDocumentParser {
  async parse(buffer: Buffer): Promise<ParsedDocumentResult> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestError('Empty DOCX buffer provided.');
    }

    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value ? result.value.trim() : '';

      if (!text) {
        throw new BadRequestError('Failed to extract text from DOCX document: DOCX contains no readable text.');
      }

      return {
        bodyText: text,
        metadata: {
          warnings: result.messages,
        },
      };
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      console.error('[DocxParser] DOCX parsing failed:', error.message);
      throw new BadRequestError(`Corrupted or invalid DOCX file: ${error.message || 'Unable to parse DOCX content.'}`);
    }
  }
}
