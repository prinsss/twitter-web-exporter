import { unsafeWindow } from '$';
import logger from '@/utils/logger';
import { ComponentType } from 'preact';

/**
 * The original XHR method backup.
 */
const xhrOpen = unsafeWindow.XMLHttpRequest.prototype.open;

/**
 * HTTP response interceptor.
 */
export type Interceptor = (
  request: Pick<Request, 'method' | 'url'>,
  response: XMLHttpRequest
) => void;

/**
 * Add extensibility for the core.
 */
export interface Extension {
  name: string;
  setup: (manager: ExtensionManager) => void;
}

/**
 * Global registration of all extensions.
 */
export class ExtensionManager {
  private extensions: Set<Extension> = new Set();
  private interceptors: Set<Interceptor> = new Set();
  private panels: Set<ComponentType> = new Set();

  constructor() {
    this.installHttpHooks();
  }

  /**
   * Register a core extension.
   */
  public add(ext: Extension) {
    this.extensions.add(ext);
    logger.debug(`Setting up extension: ${ext.name}`);
    ext.setup(this);
  }

  /**
   * Register a HTTP response interceptor.
   * This is intended to be called in the setup method of an extension.
   */
  public registerInterceptor(interceptor: Interceptor) {
    this.interceptors.add(interceptor);
  }

  /**
   * Register a panel component.
   * This is intended to be called in the setup method of an extension.
   */
  public registerPanel(component: ComponentType) {
    this.panels.add(component);
  }

  /**
   * Get all registered panel components.
   * This is intended to be called by the core UI.
   */
  public getPanels() {
    return [...this.panels.values()];
  }

  /**
   * Here we hooks the browser's XHR method to intercept Twitter's Web API calls.
   * This need to be done before any XHR request is made.
   */
  private installHttpHooks() {
    const interceptors = this.interceptors;

    unsafeWindow.XMLHttpRequest.prototype.open = function (method: string, url: string) {
      // When the request is done, we call all registered interceptors.
      this.addEventListener('load', () => {
        interceptors.forEach((func) => {
          func({ method, url }, this);
        });
      });

      // @ts-expect-error it's fine.
      xhrOpen.apply(this, arguments);
    };

    logger.error('Hooked into XMLHttpRequest.');
  }
}

/**
 * Global extension manager singleton instance.
 */
const extensions = new ExtensionManager();

export default extensions;
