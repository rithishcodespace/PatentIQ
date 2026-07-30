import type { PatentSection } from '../types/patent.types.js';

export class PatentParserService {
  async parsePdf(_pdfBuffer: Buffer): Promise<PatentSection> {
    // TODO: Use pdf-parse library to extract text, title, abstract, claims, and IPC codes from PDF
    console.log('[PatentParserService] TODO: Parse PDF buffer into structured PatentSection');
    return {
      title: '',
      abstract: '',
      claims: [],
      ipcClassifications: [],
    };
  }

  async parseCsvOrText(_rawText: string): Promise<PatentSection> {
    // TODO: Parse CSV/Text formatted patent document into structured PatentSection
    console.log('[PatentParserService] TODO: Parse CSV/Text into structured PatentSection');
    return {
      title: '',
      abstract: '',
      claims: [],
      ipcClassifications: [],
    };
  }
}
