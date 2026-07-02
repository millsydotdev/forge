export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private prefix = '[TDX]';

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private format(level: string, ...args: unknown[]): [string, ...unknown[]] {
    return [`${this.prefix} [${level}]`, ...args];
  }

  debug(...args: unknown[]) {
    if (this.level <= LogLevel.DEBUG) console.debug(...this.format('DEBUG', ...args)); // eslint-disable-line no-console
  }

  info(...args: unknown[]) {
    if (this.level <= LogLevel.INFO) console.info(...this.format('INFO', ...args)); // eslint-disable-line no-console
  }

  warn(...args: unknown[]) {
    if (this.level <= LogLevel.WARN) console.warn(...this.format('WARN', ...args)); // eslint-disable-line no-console
  }

  error(...args: unknown[]) {
    if (this.level <= LogLevel.ERROR) console.error(...this.format('ERROR', ...args)); // eslint-disable-line no-console
  }

  /** Create a performance mark. Only runs in debug mode or when perf logging is enabled. */
  mark(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  }

  /** Measure duration between two marks and log it. Returns duration in ms. */
  measure(name: string, startMark: string, endMark: string): number {
    if (typeof performance !== 'undefined') {
      try {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name);
        const duration = entries.length > 0 ? entries[entries.length - 1].duration : 0;
        if (this.level <= LogLevel.DEBUG) {
          console.debug(`${this.prefix} [PERF] ${name}: ${duration.toFixed(2)}ms`); // eslint-disable-line no-console
        }
        return duration;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  /** Clear all performance marks. */
  clearMarks() {
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

export const logger = new Logger();