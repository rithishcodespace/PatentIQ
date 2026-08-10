import type { IDocumentParser, ParsedDocumentResult } from '../interfaces/upload-processor.interface.js';
export declare class TxtParser implements IDocumentParser {
    parse(buffer: Buffer): Promise<ParsedDocumentResult>;
}
//# sourceMappingURL=txt.parser.d.ts.map