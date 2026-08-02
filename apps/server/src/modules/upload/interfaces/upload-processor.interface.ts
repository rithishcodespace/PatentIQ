export interface StandardPatentDocument {
  title: string;
  abstract: string;
  claims: string;
  keywords: string[];
  fullText: string;
}

export interface DirectTextInput {
  title: string;
  abstract: string;
  claims: string;
  keywords?: string[];
}

export interface ProcessDocumentFileInput {
  filename: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface ParsedDocumentResult {
  title?: string;
  bodyText: string;
  metadata?: Record<string, any>;
}

export interface IDocumentParser {
  parse(buffer: Buffer): Promise<ParsedDocumentResult>;
}

export interface IDocumentProcessorService {
  processFile(input: ProcessDocumentFileInput): Promise<StandardPatentDocument>;
  processDirectText(input: DirectTextInput): Promise<StandardPatentDocument>;
}
