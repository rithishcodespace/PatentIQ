import type { StandardPatentDocument } from '../interfaces/upload-processor.interface.js';
export declare class TextNormalizer {
    /**
     * Normalizes raw input text according to patent processing standards:
     * - Strips Unicode control characters
     * - Standardizes line breaks (\r\n -> \n)
     * - Removes tabs and duplicate inline spaces while preserving paragraph breaks (\n\n)
     * - Preserves section numbering, bullet points, and claim order
     */
    static normalize(text: string): string;
    /**
     * Normalizes an array of keyword strings:
     * - Trims whitespace
     * - Filters out empty strings
     * - Deduplicates keywords (case-insensitive)
     */
    static normalizeKeywords(keywords?: string[]): string[];
    /**
     * Parses sections from normalized document raw text into a StandardPatentDocument.
     * Looks for section headers such as Title:, Abstract:, Claims:, Keywords:.
     * Falls back gracefully if explicit section headings are absent.
     */
    static extractPatentSections(rawText: string, detectedTitle?: string, filenameHint?: string): StandardPatentDocument;
    /**
     * Constructs a StandardPatentDocument from direct text inputs.
     */
    static fromDirectText(titleInput: string, abstractInput: string, claimsInput: string, keywordsInput?: string[]): StandardPatentDocument;
}
//# sourceMappingURL=text-normalizer.d.ts.map