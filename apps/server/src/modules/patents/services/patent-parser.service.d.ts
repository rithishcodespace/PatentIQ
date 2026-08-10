import type { PatentSection } from '../types/patent.types.js';
export declare class PatentParserService {
    /**
     * Parses a PDF patent document buffer into a structured PatentSection object.
     */
    parsePdf(pdfBuffer: Buffer): Promise<PatentSection>;
    /**
     * Parses DOCX buffer using mammoth into a structured PatentSection.
     */
    parseDocx(docxBuffer: Buffer): Promise<PatentSection>;
    /**
     * Parses CSV or raw plain text input into a structured PatentSection object.
     */
    parseCsvOrText(rawText: string): Promise<PatentSection>;
    /**
     * Helper to parse CSV formatted content.
     */
    private parseCsvContent;
    /**
     * Simple CSV row parser handling quoted commas.
     */
    private parseCsvRow;
    /**
     * Extracts structured PatentSection fields from cleaned full text.
     */
    private extractStructuredPatentSection;
    /**
     * Splits a raw claims block text into an array of individual claim statements.
     */
    private splitIntoClaimsArray;
}
//# sourceMappingURL=patent-parser.service.d.ts.map