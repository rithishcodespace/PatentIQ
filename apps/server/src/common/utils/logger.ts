export interface ILogger {
  info(message: string, meta?: Record<string, any>): void;
  error(message: string, error?: any, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
}

export class Logger implements ILogger {
  info(message: string, meta?: Record<string, any>): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  }

  error(message: string, error?: any, meta?: Record<string, any>): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '', meta || '');
  }

  warn(message: string, meta?: Record<string, any>): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
  }

  debug(message: string, meta?: Record<string, any>): void {
    console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta || '');
  }
}

export const logger = new Logger();
