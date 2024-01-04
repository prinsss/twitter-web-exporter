import { signal } from '@preact/signals';

export interface LogLine {
  type: 'info' | 'warn' | 'error';
  line: string;
  index: number;
}

export const logLinesSignal = signal<LogLine[]>([]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogExtraArgs = any[];

/**
 * Global logger that writes logs to both screen and console.
 */
class Logger {
  private index = 0;
  private buffer: LogLine[] = [];
  private bufferTimer: number | null = null;

  public info(line: string, ...args: LogExtraArgs) {
    console.info('[twitter-web-exporter]', line, ...args);
    this.writeBuffer({ type: 'info', line, index: this.index++ });
  }

  public warn(line: string, ...args: LogExtraArgs) {
    console.warn('[twitter-web-exporter]', line, ...args);
    this.writeBuffer({ type: 'warn', line, index: this.index++ });
  }

  public error(line: string, ...args: LogExtraArgs) {
    console.error('[twitter-web-exporter]', line, ...args);
    this.writeBuffer({ type: 'error', line, index: this.index++ });
  }

  public errorWithBanner(msg: string, err?: Error, ...args: LogExtraArgs) {
    this.error(
      `${msg} (Message: ${err?.message ?? 'none'})\n` +
        '  This may be a problem caused by Twitter updates.\n  Please file an issue on GitHub:\n' +
        '  https://github.com/prinsss/twitter-web-exporter/issues',
      ...args,
    );
  }

  public debug(...args: LogExtraArgs) {
    console.debug('[twitter-web-exporter]', ...args);
  }

  /**
   * Buffer log lines to reduce the number of signal and DOM updates.
   */
  private writeBuffer(log: LogLine) {
    this.buffer.push(log);

    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer);
    }

    this.bufferTimer = window.setTimeout(() => {
      this.bufferTimer = null;
      this.flushBuffer();
    }, 0);
  }

  /**
   * Flush buffered log lines and update the UI.
   */
  private flushBuffer() {
    logLinesSignal.value = [...logLinesSignal.value, ...this.buffer];
    this.buffer = [];
  }
}

/**
 * Global logger singleton instance.
 */
const logger = new Logger();

export default logger;
