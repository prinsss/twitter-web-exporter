import { DatabaseManager } from './manager';

export * from './manager';

/**
 * Global database manager singleton instance.
 */
const databaseManager = new DatabaseManager();

export { databaseManager as db };
