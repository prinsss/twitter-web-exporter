/**
 * Global logger that writes logs to both screen and console.
 */
class Logger {
  private infoLogs: string[] = [];
  private errorLogs: string[] = [];

  public info(line: string, ...args: any[]) {
    console.info('[twitter-web-exporter]', line, ...args);
    this.infoLogs.push(line);
  }

  public error(line: string, ...args: any[]) {
    console.error('[twitter-web-exporter]', line, ...args);
    this.errorLogs.push(line);
  }

  public debug(...args: any[]) {
    console.debug('[twitter-web-exporter]', ...args);
  }
}

const logger = new Logger();

export default logger;
