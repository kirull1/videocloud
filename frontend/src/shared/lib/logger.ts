/**
 * Simple logger utility for the VideoCloud frontend
 */
export class Logger {
  private context: string;
  private isDevelopment: boolean;

  constructor(context: string) {
    this.context = context;
    this.isDevelopment = import.meta.env.MODE === 'development';
  }

  log(message: string): void {
    if (this.isDevelopment) {
      console.log(`[${this.context}] ${message}`);
    }
  }

  error(message: string, error?: Error): void {
    console.error(`[${this.context}] ERROR: ${message}`, error || '');
  }

  warn(message: string): void {
    console.warn(`[${this.context}] WARN: ${message}`);
  }

  info(message: string): void {
    if (this.isDevelopment) {
      console.info(`[${this.context}] INFO: ${message}`);
    }
  }

  debug(message: string): void {
    if (this.isDevelopment) {
      console.debug(`[${this.context}] DEBUG: ${message}`);
    }
  }
}

export const createLogger = (context: string): Logger => {
  return new Logger(context);
};
