import { BadRequestError } from '../../../common/errors/http-errors.js';
import { env } from '../../../config/env.config.js';
import {
  ALLOWED_MIME_TYPES,
  getFileExtension,
  MIME_TO_EXTENSION,
} from '../utils/upload.utils.js';

export interface FileValidationInput {
  filename?: string;
  mimetype?: string;
  buffer?: Buffer;
}

export class UploadValidator {
  /**
   * Validates uploaded document payload according to strict format, size, and extension rules.
   */
  static validate(file: FileValidationInput): {
    filename: string;
    mimetype: string;
    extension: string;
    buffer: Buffer;
    size: number;
  } {
    // 1. Missing file validation
    if (!file || !file.buffer || !file.filename || !file.mimetype) {
      throw new BadRequestError('File is missing or payload is incomplete.');
    }

    const { filename, mimetype, buffer } = file;

    // 2. Empty file validation
    if (buffer.length === 0) {
      throw new BadRequestError('Uploaded file is empty (0 bytes).');
    }

    // 3. Maximum size validation
    const maxMB = env.MAX_FILE_SIZE_MB || 20;
    const maxSizeBytes = maxMB * 1024 * 1024;
    if (buffer.length > maxSizeBytes) {
      throw new BadRequestError(
        `File size exceeds maximum allowed limit of ${maxMB} MB (${buffer.length} bytes uploaded).`
      );
    }

    // 4. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(mimetype as any)) {
      throw new BadRequestError(
        `Unsupported MIME type '${mimetype}'. Allowed types: PDF (application/pdf), DOCX (application/vnd.openxmlformats-officedocument.wordprocessingml.document), TXT (text/plain).`
      );
    }

    // 5. Extension validation
    const extension = getFileExtension(filename);
    const expectedExtension = MIME_TO_EXTENSION[mimetype];

    if (!extension || extension !== expectedExtension) {
      throw new BadRequestError(
        `Invalid file extension '.${extension}' for MIME type '${mimetype}'. Expected '.${expectedExtension}'.`
      );
    }

    return {
      filename,
      mimetype,
      extension,
      buffer,
      size: buffer.length,
    };
  }
}
