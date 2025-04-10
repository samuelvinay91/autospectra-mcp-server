// Simple logger implementation
class Logger {
  info(message: string, ...args: any[]) {
    console.info(`[INFO] ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
