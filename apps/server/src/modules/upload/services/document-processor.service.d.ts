import type { IDocumentProcessorService, IDocumentParser, ProcessDocumentFileInput, DirectTextInput, StandardPatentDocument } from '../interfaces/upload-processor.interface.js';
export declare class DocumentProcessorService implements IDocumentProcessorService {
    private readonly parsers;
    constructor(pdfParser?: IDocumentParser, docxParser?: IDocumentParser, txtParser?: IDocumentParser);
    /**
     * Processes an uploaded document file (PDF, DOCX, TXT) and returns a StandardPatentDocument.
     */
    processFile(input: ProcessDocumentFileInput): Promise<StandardPatentDocument>;
    /**
     * Processes directly entered invention text (JSON) and returns a StandardPatentDocument.
     */
    processDirectText(input: DirectTextInput): Promise<StandardPatentDocument>;
}
//# sourceMappingURL=document-processor.service.d.ts.map