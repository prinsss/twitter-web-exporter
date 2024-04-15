import { AppOptionsManager } from './manager';

export * from './manager';

/**
 * Global options manager singleton instance.
 */
const appOptionsManager = new AppOptionsManager();

export { appOptionsManager as options };
