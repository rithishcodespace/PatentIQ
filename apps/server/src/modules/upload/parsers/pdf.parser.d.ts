import type { IDocumentParser, ParsedDocumentResult } from '../interfaces/upload-processor.interface.js';
export declare class PdfParser implements IDocumentParser {
    parse(buffer: Buffer): Promise<ParsedDocumentResult>;
}
//# sourceMappingURL=pdf.parser.d.ts.map