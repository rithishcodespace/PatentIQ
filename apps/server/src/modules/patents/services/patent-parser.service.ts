import * as pdfParseModule from 'pdf-parse';
import mammoth from 'mammoth';
import type { PatentSection } from '../types/patent.types.js';
import { PatentCleanerUtils } from '../utils/patent-cleaner.utils.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';

export class PatentParserService {
  /**
   * Parses a PDF patent document buffer into a structured PatentSection object.
   */
  async parsePdf(pdfBuffer: Buffer): Promise<PatentSection> {
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new BadRequestError('Empty PDF buffer provided for patent parsing.');
    }

    try {
      const pdf = typeof pdfParseModule === 'function'
        ? pdfParseModule
        : (pdfParseModule as any).default || pdfParseModule;
      const data = await pdf(pdfBuffer);
      const rawText = data.text ? data.text.trim() : '';

      if (!rawText) {
        throw new BadRequestError('Failed to extract text from PDF document: File contains no readable text.');
      }

      const cleanedText = PatentCleanerUtils.cleanText(rawText);
      const metadataTitle = data.info && typeof data.info.Title === 'string' && data.info.Title.trim().length > 0
        ? data.info.Title.trim()
        : undefined;

      return this.extractStructuredPatentSection(cleanedText, metadataTitle);
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      console.error('[PatentParserService] PDF parsing failed:', error.message);
      throw new BadRequestError(`Corrupted or unreadable PDF document: ${error.message}`);
    }
  }

  /**
   * Parses DOCX buffer using mammoth into a structured PatentSection.
   */
  async parseDocx(docxBuffer: Buffer): Promise<PatentSection> {
    if (!docxBuffer || docxBuffer.length === 0) {
      throw new BadRequestError('Empty DOCX buffer provided for patent parsing.');
    }

    try {
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      const rawText = result.value ? result.value.trim() : '';

      if (!rawText) {
        throw new BadRequestError('Failed to extract text from DOCX document: File contains no readable text.');
      }

      const cleanedText = PatentCleanerUtils.cleanText(rawText);
      return this.extractStructuredPatentSection(cleanedText);
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      console.error('[PatentParserService] DOCX parsing failed:', error.message);
      throw new BadRequestError(`Corrupted or unreadable DOCX document: ${error.message}`);
    }
  }

  /**
   * Parses CSV or raw plain text input into a structured PatentSection object.
   */
  async parseCsvOrText(rawText: string): Promise<PatentSection> {
    if (!rawText || !rawText.trim()) {
      throw new BadRequestError('Empty text provided for patent parsing.');
    }

    const trimmed = rawText.trim();
    const lines = trimmed.split('\n');

    // Check if input is a CSV format with headers
    if (lines.length > 0) {
      const headerLine = (lines[0] || '').toLowerCase();
      if (headerLine.includes('title') && (headerLine.includes('abstract') || headerLine.includes('claims') || headerLine.includes('ipc'))) {
        return this.parseCsvContent(lines);
      }
    }

    const cleanedText = PatentCleanerUtils.cleanText(trimmed);
    return this.extractStructuredPatentSection(cleanedText);
  }

  /**
   * Helper to parse CSV formatted content.
   */
  private parseCsvContent(lines: string[]): PatentSection {
    const headerRow = this.parseCsvRow(lines[0] || '');
    const headers = headerRow.map((h) => h.toLowerCase());

    const titleIdx = headers.findIndex((h) => h.includes('title'));
    const abstractIdx = headers.findIndex((h) => h.includes('abstract') || h.includes('summary'));
    const claimsIdx = headers.findIndex((h) => h.includes('claim'));
    const ipcIdx = headers.findIndex((h) => h.includes('ipc') || h.includes('classification'));
    const descIdx = headers.findIndex((h) => h.includes('description'));

    const dataRow = lines.length > 1 ? this.parseCsvRow(lines[1] || '') : [];


    const rawTitle = titleIdx !== -1 && dataRow[titleIdx] ? dataRow[titleIdx] : '';
    const rawAbstract = abstractIdx !== -1 && dataRow[abstractIdx] ? dataRow[abstractIdx] : '';
    const rawClaims = claimsIdx !== -1 && dataRow[claimsIdx] ? dataRow[claimsIdx] : '';
    const rawIpc = ipcIdx !== -1 && dataRow[ipcIdx] ? dataRow[ipcIdx] : '';
    const rawDesc = descIdx !== -1 && dataRow[descIdx] ? dataRow[descIdx] : '';

    const title = PatentCleanerUtils.cleanText(rawTitle) || 'Untitled Patent Document';
    const abstract = PatentCleanerUtils.cleanText(rawAbstract);
    const claimsStr = PatentCleanerUtils.cleanText(rawClaims);
    const claims = this.splitIntoClaimsArray(claimsStr);
    const ipcClassifications = PatentCleanerUtils.extractIpcCodes(`${rawIpc} ${rawTitle} ${rawAbstract} ${rawClaims}`);
    const description = rawDesc ? PatentCleanerUtils.cleanText(rawDesc) : undefined;

    return {
      title,
      abstract,
      claims,
      ipcClassifications,
      ...(description ? { description } : {}),
    };
  }

  /**
   * Simple CSV row parser handling quoted commas.
   */
  private parseCsvRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  }

  /**
   * Extracts structured PatentSection fields from cleaned full text.
   */
  private extractStructuredPatentSection(cleanedText: string, metadataTitle?: string): PatentSection {
    let title = metadataTitle ? PatentCleanerUtils.cleanText(metadataTitle) : '';
    let abstract = '';
    let claimsText = '';

    // 1. Title Extraction
    const titleMatch = cleanedText.match(/(?:^|\n)\s*(?:TITLE|Patent Title|Invention Title)\s*:\s*([^\n]+)/i);
    if (titleMatch && titleMatch[1]) {
      title = PatentCleanerUtils.cleanText(titleMatch[1]);
    }

    // 2. Abstract Extraction
    const abstractMatch = cleanedText.match(/(?:^|\n)\s*(?:ABSTRACT|Summary)\s*:\s*([\s\S]*?)(?=\n\s*(?:CLAIMS|NOVEL FEATURES|DESCRIPTION|IPC|KEYWORDS|TITLE)\s*:|$)/i);
    if (abstractMatch && abstractMatch[1]) {
      abstract = PatentCleanerUtils.cleanText(abstractMatch[1]);
    }

    // 3. Claims Extraction
    const claimsMatch = cleanedText.match(/(?:^|\n)\s*(?:CLAIMS|What Is Claimed Is|Novel Features)\s*:\s*([\s\S]*?)(?=\n\s*(?:DESCRIPTION|IPC|KEYWORDS|ABSTRACT|TITLE)\s*:|$)/i);
    if (claimsMatch && claimsMatch[1]) {
      claimsText = PatentCleanerUtils.cleanText(claimsMatch[1]);
    }

    // Fallback split by paragraphs when explicit headings are missing
    const paragraphs = cleanedText.split('\n\n').filter((p) => p.trim().length > 0);

    if (!title) {
      if (paragraphs[0] && paragraphs[0].length < 200) {
        title = paragraphs[0];
      } else {
        title = 'Untitled Patent Document';
      }
    }

    if (!abstract) {
      if (paragraphs.length > 1 && paragraphs[0] === title) {
        abstract = paragraphs[1] || '';
      } else if (paragraphs[0]) {
        abstract = paragraphs[0];
      } else {
        abstract = cleanedText.slice(0, 500);
      }
    }


    if (!claimsText) {
      const nonTitleParagraphs = paragraphs.filter((p) => p !== title && p !== abstract);
      claimsText = nonTitleParagraphs.length > 0 ? nonTitleParagraphs.join('\n\n') : cleanedText;
    }

    const claims = this.splitIntoClaimsArray(claimsText);
    const ipcClassifications = PatentCleanerUtils.extractIpcCodes(cleanedText);

    return {
      title,
      abstract,
      claims,
      ipcClassifications,
    };
  }

  /**
   * Splits a raw claims block text into an array of individual claim statements.
   */
  private splitIntoClaimsArray(claimsBlock: string): string[] {
    if (!claimsBlock) return [];

    // Split by numbered claim boundaries (e.g., "1. ", "2. ", "Claim 1:", etc.)
    const claimMatches = claimsBlock.split(/(?=\b(?:\d+\.|\(\d+\)|Claim\s+\d+:?)\s+)/i);
    const cleanedClaims = claimMatches
      .map((c) => PatentCleanerUtils.cleanText(c))
      .filter((c) => c.length > 0);

    if (cleanedClaims.length > 0) {
      return cleanedClaims;
    }

    // Fallback: split by lines/paragraphs
    return claimsBlock
      .split(/\n\n+/)
      .map((c) => PatentCleanerUtils.cleanText(c))
      .filter((c) => c.length > 0);
  }
}

