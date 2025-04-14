/**
 * Simple logger utility for the VideoCloud backend
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(message: string): void {
    console.log(`[${this.context}] ${message}`);
  }

  error(message: string, error?: Error): void {
    console.error(`[${this.context}] ERROR: ${message}`, error || '');
  }

  warn(message: string): void {
    console.warn(`[${this.context}] WARN: ${message}`);
  }

  info(message: string): void {
    console.info(`[${this.context}] INFO: ${message}`);
  }

  debug(message: string): void {
    console.debug(`[${this.context}] DEBUG: ${message}`);
  }
}

export const createLogger = (context: string): Logger => {
  return new Logger(context);
};
