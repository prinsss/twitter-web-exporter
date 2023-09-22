import { signal } from '@preact/signals';

export interface LogLine {
  type: 'info' | 'error';
  line: string;
  index: number;
}

export const logLinesSignal = signal<LogLine[]>([]);

/**
 * Global logger that writes logs to both screen and console.
 */
class Logger {
  private index = 0;

  public info(line: string, ...args: any[]) {
    console.info('[twitter-web-exporter]', line, ...args);
    logLinesSignal.value = [...logLinesSignal.value, { type: 'info', line, index: this.index++ }];
  }

  public error(line: string, ...args: any[]) {
    console.error('[twitter-web-exporter]', line, ...args);
    logLinesSignal.value = [...logLinesSignal.value, { type: 'error', line, index: this.index++ }];
  }

  public errorWithBanner(msg: string, err: Error) {
    this.error(
      `${msg} (Message: ${err.message})\n` +
        '  This may be a problem caused by Twitter updates.\n  Please file an issue on GitHub:\n' +
        '  https://github.com/prinsss/twitter-web-exporter/issues'
    );
  }

  public debug(...args: any[]) {
    console.debug('[twitter-web-exporter]', ...args);
  }
}

/**
 * Global logger singleton instance.
 */
const logger = new Logger();

export default logger;
