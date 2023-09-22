import { ExtensionManager } from './manager';

export * from './manager';
export * from './extension';

/**
 * Global extension manager singleton instance.
 */
const extensionManager = new ExtensionManager();

export default extensionManager;
