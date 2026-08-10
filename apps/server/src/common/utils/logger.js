export class Logger {
    info(message, meta) {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
    }
    error(message, error, meta) {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '', meta || '');
    }
    warn(message, meta) {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
    }
    debug(message, meta) {
        console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta || '');
    }
}
export const logger = new Logger();
//# sourceMappingURL=logger.js.map