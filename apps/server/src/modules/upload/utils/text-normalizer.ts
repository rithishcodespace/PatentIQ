import type { StandardPatentDocument } from '../interfaces/upload-processor.interface.js';

export class TextNormalizer {
  /**
   * Normalizes raw input text according to patent processing standards:
   * - Strips Unicode control characters
   * - Standardizes line breaks (\r\n -> \n)
   * - Removes tabs and duplicate inline spaces while preserving paragraph breaks (\n\n)
   * - Preserves section numbering, bullet points, and claim order
   */
  static normalize(text: string): string {
    if (!text) return '';

    // 1. Remove non-printable Unicode control characters (keep \n and \t temporarily for splitting)
    let cleaned = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFEFF]/g, '');

    // 2. Standardize line endings to \n
    cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 3. Process line by line to clean inline whitespace while preserving line structure
    const lines = cleaned.split('\n').map((line) => {
      // Replace tabs with a single space
      let l = line.replace(/\t/g, ' ');
      // Replace multiple consecutive horizontal spaces with a single space
      l = l.replace(/[ \t]{2,}/g, ' ');
      return l.trim();
    });

    // 4. Join back lines and collapse 3+ consecutive newlines to \n\n (preserving double newline paragraphs)
    const normalizedText = lines.join('\n').replace(/\n{3,}/g, '\n\n');

    return normalizedText.trim();
  }

  /**
   * Normalizes an array of keyword strings:
   * - Trims whitespace
   * - Filters out empty strings
   * - Deduplicates keywords (case-insensitive)
   */
  static normalizeKeywords(keywords?: string[]): string[] {
    if (!keywords || !Array.isArray(keywords)) return [];

    const seen = new Set<string>();
    const result: string[] = [];

    for (const kw of keywords) {
      if (typeof kw !== 'string') continue;
      const normalizedKw = this.normalize(kw);
      if (!normalizedKw) continue;
      const lower = normalizedKw.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        result.push(normalizedKw);
      }
    }

    return result;
  }

  /**
   * Parses sections from normalized document raw text into a StandardPatentDocument.
   * Looks for section headers such as Title:, Abstract:, Claims:, Keywords:.
   * Falls back gracefully if explicit section headings are absent.
   */
  static extractPatentSections(
    rawText: string,
    detectedTitle?: string,
    filenameHint?: string
  ): StandardPatentDocument {
    const normalizedFullText = this.normalize(rawText);

    let title = detectedTitle ? this.normalize(detectedTitle) : '';
    let abstract = '';
    let claims = '';
    let keywords: string[] = [];

    // Helper regex to extract section contents when section labels are present
    const titleMatch = normalizedFullText.match(/(?:^|\n)\s*(?:TITLE|Patent Title|Invention Title)\s*:\s*([^\n]+)/i);
    const abstractMatch = normalizedFullText.match(/(?:^|\n)\s*(?:ABSTRACT|Summary)\s*:\s*([\s\S]*?)(?=\n\s*(?:CLAIMS|NOVEL FEATURES|KEYWORDS|TITLE)\s*:|$)/i);
    const claimsMatch = normalizedFullText.match(/(?:^|\n)\s*(?:CLAIMS|Novel Features|What Is Claimed Is)\s*:\s*([\s\S]*?)(?=\n\s*(?:KEYWORDS|ABSTRACT|TITLE)\s*:|$)/i);
    const keywordsMatch = normalizedFullText.match(/(?:^|\n)\s*(?:KEYWORDS|Key Words|Tags)\s*:\s*([^\n]+)/i);

    if (titleMatch && titleMatch[1]) {
      title = this.normalize(titleMatch[1]);
    }

    if (abstractMatch && abstractMatch[1]) {
      abstract = this.normalize(abstractMatch[1]);
    }

    if (claimsMatch && claimsMatch[1]) {
      claims = this.normalize(claimsMatch[1]);
    }

    if (keywordsMatch && keywordsMatch[1]) {
      const rawKwStr = keywordsMatch[1].trim();
      const splitKws = rawKwStr.split(/[,;\n|]/).map((k) => k.trim());
      keywords = this.normalizeKeywords(splitKws);
    }

    // Fallback extraction when explicit section headers were not found
    const paragraphs = normalizedFullText.split('\n\n').filter((p) => p.trim().length > 0);
    const firstParagraph = paragraphs[0] ?? '';
    const secondParagraph = paragraphs[1] ?? '';

    if (!title) {
      if (firstParagraph.length > 0 && firstParagraph.length < 200) {
        title = firstParagraph.trim();
      } else if (filenameHint) {
        // Strip extension from filename hint
        title = filenameHint.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      } else {
        title = 'Untitled Patent Document';
      }
    }

    if (!abstract) {
      // Use first paragraph (or second if first was title) as abstract fallback
      if (paragraphs.length > 1 && firstParagraph.trim() === title) {
        abstract = secondParagraph.trim();
      } else if (firstParagraph.length > 0) {
        abstract = firstParagraph.trim();
      } else {
        abstract = normalizedFullText.slice(0, 500);
      }
    }

    if (!claims) {
      // Use remaining body text or full text as claims fallback
      const nonTitleParagraphs = paragraphs.filter((p) => p.trim() !== title && p.trim() !== abstract);
      if (nonTitleParagraphs.length > 0) {
        claims = nonTitleParagraphs.join('\n\n');
      } else {
        claims = normalizedFullText;
      }
    }

    return {
      title,
      abstract,
      claims,
      keywords,
      fullText: normalizedFullText,
    };
  }

  /**
   * Constructs a StandardPatentDocument from direct text inputs.
   */
  static fromDirectText(
    titleInput: string,
    abstractInput: string,
    claimsInput: string,
    keywordsInput?: string[]
  ): StandardPatentDocument {
    const title = this.normalize(titleInput);
    const abstract = this.normalize(abstractInput);
    const claims = this.normalize(claimsInput);
    const keywords = this.normalizeKeywords(keywordsInput);

    // Build unified fullText representation
    const fullTextParts = [
      `Title: ${title}`,
      `Abstract:\n${abstract}`,
      `Claims:\n${claims}`,
    ];

    if (keywords.length > 0) {
      fullTextParts.push(`Keywords: ${keywords.join(', ')}`);
    }

    const fullText = fullTextParts.join('\n\n');

    return {
      title,
      abstract,
      claims,
      keywords,
      fullText,
    };
  }
}
