import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { NotFoundError, InternalServerError } from '../../../common/errors/http-errors.js';
import { env } from '../../../config/env.config.js';
import { UploadValidator } from '../validators/upload.validator.js';
import { ensureDirectoryExists, getStorageSubfolder, sanitizeFilename, } from '../utils/upload.utils.js';
export class UploadService {
    uploadRepository;
    constructor(uploadRepository) {
        this.uploadRepository = uploadRepository;
    }
    async uploadDocument(fileInput) {
        const filenameForLog = fileInput?.filename || 'unknown';
        const mimetypeForLog = fileInput?.mimetype || 'unknown';
        console.log(`[UploadService] Upload started for file '${filenameForLog}' (MIME: ${mimetypeForLog})`);
        let validated;
        try {
            validated = UploadValidator.validate(fileInput);
        }
        catch (error) {
            console.error(`[UploadService] Upload validation failed for '${filenameForLog}': ${error.message}`);
            throw error;
        }
        const { filename, mimetype, extension, buffer, size } = validated;
        const sanitizedOriginalName = sanitizeFilename(filename);
        const uniqueId = crypto.randomUUID();
        const storedFileName = `${uniqueId}.${extension}`;
        const storageBaseDir = env.STORAGE_PATH || './storage/uploads';
        const subFolder = getStorageSubfolder(extension);
        const targetDir = path.resolve(process.cwd(), storageBaseDir, subFolder);
        const storagePath = path.join(targetDir, storedFileName);
        try {
            await ensureDirectoryExists(targetDir);
            await fs.writeFile(storagePath, buffer);
        }
        catch (err) {
            console.error(`[UploadService] Storage write failure for '${sanitizedOriginalName}':`, err);
            throw new InternalServerError('Failed to save document to local storage.');
        }
        try {
            const documentRecord = await this.uploadRepository.create({
                userId: fileInput.userId || null,
                originalFileName: sanitizedOriginalName,
                storedFileName,
                mimeType: mimetype,
                extension,
                size,
                storagePath,
                status: 'Uploaded',
            });
            console.log(`[UploadService] Upload completed successfully. Doc ID: ${documentRecord.id}, Size: ${size} bytes, MIME: ${mimetype}`);
            return documentRecord;
        }
        catch (dbErr) {
            console.error(`[UploadService] Database insertion failure for '${storedFileName}':`, dbErr);
            // Clean up orphaned file on disk
            try {
                await fs.unlink(storagePath);
            }
            catch (cleanupErr) {
                console.warn(`[UploadService] Failed to clean up orphaned file '${storagePath}':`, cleanupErr);
            }
            throw new InternalServerError('Failed to persist document metadata in database.');
        }
    }
    async getMetadata(id) {
        const document = await this.uploadRepository.findById(id);
        if (!document) {
            throw new NotFoundError(`Document with ID '${id}' not found.`);
        }
        return document;
    }
    async deleteDocument(id) {
        const document = await this.uploadRepository.findById(id);
        if (!document) {
            throw new NotFoundError(`Document with ID '${id}' not found.`);
        }
        // 1. Delete record from database
        await this.uploadRepository.deleteById(id);
        // 2. Delete physical file from disk (graceful cleanup)
        try {
            await fs.unlink(document.storagePath);
            console.log(`[UploadService] Deleted physical file: ${document.storagePath}`);
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                console.warn(`[UploadService] Physical file deletion encountered non-fatal error: ${err.message}`);
            }
            else {
                console.warn(`[UploadService] Physical file not found on disk during deletion: ${document.storagePath}`);
            }
        }
        return true;
    }
}
//# sourceMappingURL=upload.service.js.map