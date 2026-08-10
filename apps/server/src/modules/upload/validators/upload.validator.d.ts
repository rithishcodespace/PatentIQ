export interface FileValidationInput {
    filename?: string;
    mimetype?: string;
    buffer?: Buffer;
}
export declare class UploadValidator {
    /**
     * Validates uploaded document payload according to strict format, size, and extension rules.
     */
    static validate(file: FileValidationInput): {
        filename: string;
        mimetype: string;
        extension: string;
        buffer: Buffer;
        size: number;
    };
}
//# sourceMappingURL=upload.validator.d.ts.map