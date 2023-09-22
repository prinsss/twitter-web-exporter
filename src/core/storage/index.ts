import { DatabaseManager } from './database';
import { AppOptionsManager } from './options';

export * from './database';
export * from './options';

/**
 * Global options manager singleton instance.
 */
const appOptionsManager = new AppOptionsManager();

/**
 * Global database manager singleton instance.
 */
const databaseManager = new DatabaseManager();

export { appOptionsManager as options, databaseManager as db };
