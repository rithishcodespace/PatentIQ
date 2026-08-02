import type { CompareDocumentRequestDto, CompareDocumentResponseDto } from '../dto/upload.dto.js';

export interface IUploadComparisonService {
  compareDocument(dto: CompareDocumentRequestDto): Promise<CompareDocumentResponseDto>;
}
