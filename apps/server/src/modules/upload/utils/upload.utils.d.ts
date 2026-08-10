export declare const ALLOWED_MIME_TYPES: readonly ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];
export declare const MIME_TO_EXTENSION: Record<string, string>;
export declare const EXTENSION_TO_MIME: Record<string, string>;
/**
 * Sanitizes input filename to prevent directory traversal or malicious character injections.
 */
export declare function sanitizeFilename(filename: string): string;
/**
 * Extracts normalized lower-case file extension without leading dot.
 */
export declare function getFileExtension(filename: string): string;
/**
 * Maps extension to storage sub-folder name (pdf, docx, txt).
 */
export declare function getStorageSubfolder(extension: string): string;
/**
 * Ensures target directory exists on local disk.
 */
export declare function ensureDirectoryExists(dirPath: string): Promise<void>;
//# sourceMappingURL=upload.utils.d.ts.map