import type { UploadStatus } from '../interfaces/upload.interface.js';

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
