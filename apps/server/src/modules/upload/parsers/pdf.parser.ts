import * as pdfParseModule from 'pdf-parse';
import { BadRequestError } from '../../../common/errors/http-errors.js';
import type { IDocumentParser, ParsedDocumentResult } from '../interfaces/upload-processor.interface.js';

export class PdfParser implements IDocumentParser {
  async parse(buffer: Buffer): Promise<ParsedDocumentResult> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestError('Empty PDF buffer provided.');
    }

    try {
      const pdf = typeof pdfParseModule === 'function' ? pdfParseModule : (pdfParseModule as any).default || pdfParseModule;
      const data = await pdf(buffer);
      const text = data.text ? data.text.trim() : '';

      if (!text) {
        throw new BadRequestError('Failed to extract text from PDF document: PDF contains no readable text.');
      }

      let detectedTitle: string | undefined = undefined;

      // Extract title from PDF metadata if available
      if (data.info && typeof data.info.Title === 'string' && data.info.Title.trim().length > 0) {
        detectedTitle = data.info.Title.trim();
      }

      return {
        title: detectedTitle,
        bodyText: text,
        metadata: {
          numPages: data.numpages,
          info: data.info,
        },
      };
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      console.error('[PdfParser] PDF parsing failed:', error.message);
      throw new BadRequestError(`Corrupted or invalid PDF file: ${error.message || 'Unable to parse PDF content.'}`);
    }
  }
}
