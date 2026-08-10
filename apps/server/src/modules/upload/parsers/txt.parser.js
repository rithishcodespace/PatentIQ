import { BadRequestError } from '../../../common/errors/http-errors.js';
export class TxtParser {
    async parse(buffer) {
        if (!buffer || buffer.length === 0) {
            throw new BadRequestError('Empty TXT buffer provided.');
        }
        try {
            // Decode buffer as UTF-8 string
            const text = buffer.toString('utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
            if (!text) {
                throw new BadRequestError('Failed to extract text from TXT document: Document is empty.');
            }
            return {
                bodyText: text,
            };
        }
        catch (error) {
            if (error instanceof BadRequestError) {
                throw error;
            }
            console.error('[TxtParser] TXT parsing failed:', error.message);
            throw new BadRequestError(`Invalid or unsupported encoding in TXT file: ${error.message}`);
        }
    }
}
//# sourceMappingURL=txt.parser.js.map