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
