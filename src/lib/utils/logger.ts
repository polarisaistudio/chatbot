/**
 * Simple logging utility
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  level?: LogLevel;
  context?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString();
    const context = options?.context ? `[${options.context}]` : '';
    const metadata = options?.metadata ? JSON.stringify(options.metadata) : '';

    return `${timestamp} ${context} ${message} ${metadata}`.trim();
  }

  info(message: string, options?: LogOptions) {
    console.log(this.formatMessage(message, { ...options, level: 'info' }));
  }

  warn(message: string, options?: LogOptions) {
    console.warn(this.formatMessage(message, { ...options, level: 'warn' }));
  }

  error(message: string, error?: Error, options?: LogOptions) {
    console.error(
      this.formatMessage(message, {
        ...options,
        level: 'error',
        metadata: {
          ...options?.metadata,
          error: error?.message,
          stack: this.isDevelopment ? error?.stack : undefined,
        },
      })
    );
  }

  debug(message: string, options?: LogOptions) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage(message, { ...options, level: 'debug' }));
    }
  }
}

export const logger = new Logger();
