import { BadRequestError, UnprocessableEntityError } from '../../../common/errors/http-errors.js';
import type {
  IDocumentProcessorService,
  IDocumentParser,
  ProcessDocumentFileInput,
  DirectTextInput,
  StandardPatentDocument,
} from '../interfaces/upload-processor.interface.js';
import { PdfParser } from '../parsers/pdf.parser.js';
import { DocxParser } from '../parsers/docx.parser.js';
import { TxtParser } from '../parsers/txt.parser.js';
import { TextNormalizer } from '../utils/text-normalizer.js';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const MIN_TEXT_LENGTH = 10;

export class DocumentProcessorService implements IDocumentProcessorService {
  private readonly parsers: Map<string, IDocumentParser>;

  constructor(
    pdfParser?: IDocumentParser,
    docxParser?: IDocumentParser,
    txtParser?: IDocumentParser
  ) {
    const pdf = pdfParser || new PdfParser();
    const docx = docxParser || new DocxParser();
    const txt = txtParser || new TxtParser();

    this.parsers = new Map<string, IDocumentParser>([
      ['application/pdf', pdf],
      ['pdf', pdf],
      ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', docx],
      ['docx', docx],
      ['text/plain', txt],
      ['txt', txt],
    ]);
  }

  /**
   * Processes an uploaded document file (PDF, DOCX, TXT) and returns a StandardPatentDocument.
   */
  async processFile(input: ProcessDocumentFileInput): Promise<StandardPatentDocument> {
    const startTime = Date.now();
    const { filename, mimetype, buffer, size } = input;

    console.log(`[DocumentProcessorService] Document processing started for file '${filename}' (MIME: ${mimetype}, Size: ${size} bytes)`);

    // 1. File size validation
    if (size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestError(`File size exceeds maximum allowed limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`);
    }

    if (!buffer || buffer.length === 0) {
      throw new BadRequestError('Uploaded file is empty (0 bytes).');
    }

    // 2. Parser selection by MIME type or extension
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const parser = this.parsers.get(mimetype.toLowerCase()) || this.parsers.get(extension);

    if (!parser) {
      console.warn(`[DocumentProcessorService] Unsupported file type rejected: MIME '${mimetype}', ext '${extension}'`);
      throw new UnprocessableEntityError(`Unsupported file format '${mimetype || extension}'. Supported formats are PDF, DOCX, and TXT.`);
    }

    const parserType = extension || mimetype;
    console.log(`[DocumentProcessorService] Using parser '${parserType}' for file '${filename}'`);

    // 3. Document text extraction
    let parsedResult;
    try {
      parsedResult = await parser.parse(buffer);
    } catch (err: any) {
      console.error(`[DocumentProcessorService] Parser error for file '${filename}': ${err.message}`);
      throw err;
    }

    const { bodyText, title: detectedTitle } = parsedResult;

    // 4. Text length validation
    if (!bodyText || bodyText.trim().length === 0) {
      throw new BadRequestError('Document contains no extractable text content.');
    }

    if (bodyText.trim().length < MIN_TEXT_LENGTH) {
      throw new BadRequestError(`Extracted document text is extremely short (${bodyText.trim().length} chars). Minimum ${MIN_TEXT_LENGTH} characters required.`);
    }

    // 5. Text normalization and section extraction
    const standardDoc = TextNormalizer.extractPatentSections(bodyText, detectedTitle, filename);

    const extractionTimeMs = Date.now() - startTime;
    console.log(`[DocumentProcessorService] Processing completed successfully for '${filename}'. Parser: '${parserType}', Extraction Time: ${extractionTimeMs}ms, Extracted Text Length: ${standardDoc.fullText.length} chars`);

    return standardDoc;
  }

  /**
   * Processes directly entered invention text (JSON) and returns a StandardPatentDocument.
   */
  async processDirectText(input: DirectTextInput): Promise<StandardPatentDocument> {
    const startTime = Date.now();
    console.log('[DocumentProcessorService] Direct text processing started');

    if (!input) {
      throw new BadRequestError('Direct text input body is required.');
    }

    const { title, abstract, claims, keywords } = input;

    // 1. Validation for missing or empty mandatory fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new BadRequestError('Patent title is required and cannot be empty.');
    }

    if (!abstract || typeof abstract !== 'string' || abstract.trim().length === 0) {
      throw new BadRequestError('Patent abstract is required and cannot be empty.');
    }

    if (!claims || typeof claims !== 'string' || claims.trim().length === 0) {
      throw new BadRequestError('Patent claims / novel features are required and cannot be empty.');
    }

    // 2. Validation for minimum text length
    const totalChars = title.trim().length + abstract.trim().length + claims.trim().length;
    if (totalChars < MIN_TEXT_LENGTH) {
      throw new BadRequestError(`Entered invention text is extremely short (${totalChars} chars). Minimum ${MIN_TEXT_LENGTH} characters required.`);
    }

    // 3. Normalize & structure into StandardPatentDocument
    const standardDoc = TextNormalizer.fromDirectText(title, abstract, claims, keywords);

    const processingTimeMs = Date.now() - startTime;
    console.log(`[DocumentProcessorService] Direct text processing completed successfully. Processing Time: ${processingTimeMs}ms, Extracted Text Length: ${standardDoc.fullText.length} chars`);

    return standardDoc;
  }
}
