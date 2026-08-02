import type { UploadStatus } from '../interfaces/upload.interface.js';
import type { StandardPatentDocument } from '../interfaces/upload-processor.interface.js';

export interface DocumentResponseDto {
  id: string;
  originalFileName: string;
  storedFileName: string;
  mimeType: string;
  size: number;
  status: UploadStatus;
  uploadedAt?: string;
}

export interface UploadSuccessResponseDto {
  success: boolean;
  document: DocumentResponseDto;
}

export interface DeleteSuccessResponseDto {
  success: boolean;
  message: string;
}

export interface ProcessTextRequestDto {
  title: string;
  abstract: string;
  claims: string;
  keywords?: string[];
}

export interface ProcessDocumentResponseDto {
  success: boolean;
  data: StandardPatentDocument;
}

export interface EmbedDocumentRequestDto {
  documentId?: string;
  document?: StandardPatentDocument;
}

export interface EmbeddingMetadataDto {
  model: string;
  dimensions: number;
  sections: string[];
  generatedAt: string;
}

export interface EmbedDocumentResponseDto {
  success: boolean;
  embedding: EmbeddingMetadataDto;
}

export interface CompareDocumentRequestDto {
  documentId?: string;
  document?: StandardPatentDocument;
  topK?: number;
}

export interface ComparisonPatentMatch {
  rank: number;
  patentId: string;
  title: string;
  similarityScore: number;
  ipc?: string;
  country?: string;
  publicationDate?: string;
  matchingSections: string[];
}

export interface ComparisonAnalysisSummary {
  summary: string;
  novelty: string;
  overlappingClaims: string[];
  recommendations: string[];
}

export interface CompareDocumentResponseDto {
  success: boolean;
  document: {
    id?: string | undefined;
    title: string;
  };
  retrieval: {
    topK: number;
    retrievalConfidence: number;
  };
  matches: ComparisonPatentMatch[];
  analysis: ComparisonAnalysisSummary;
  searchHistoryId?: string | undefined;
}
