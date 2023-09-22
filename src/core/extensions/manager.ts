import { unsafeWindow } from '$';
import { Signal } from '@preact/signals';
import { options } from '@/core/storage';
import logger from '@/utils/logger';
import { Extension, ExtensionConstructor, Interceptor } from './extension';

/**
 * The original XHR method backup.
 */
const xhrOpen = unsafeWindow.XMLHttpRequest.prototype.open;

/**
 * The registry for all extensions.
 */
export class ExtensionManager {
  private extensions: Map<string, Extension> = new Map();
  private disabledExtensions: Set<string> = new Set();

  /**
   * Signal for subscribing to extension changes.
   */
  public signal = new Signal(1);

  constructor() {
    this.installHttpHooks();
    this.disabledExtensions = new Set(options.get('disabledExtensions', []));
  }

  /**
   * Register and instantiate a new extension.
   *
   * @param ctor Extension constructor.
   */
  public add(ctor: ExtensionConstructor) {
    try {
      logger.debug(`Register new extension: ${ctor.name}`);
      const instance = new ctor(this);
      this.extensions.set(instance.name, instance);
    } catch (err) {
      logger.error(`Failed to register extension: ${ctor.name}`, err);
    }
  }

  /**
   * Set up all enabled extensions.
   */
  public start() {
    for (const ext of this.extensions.values()) {
      if (this.disabledExtensions.has(ext.name)) {
        this.disable(ext.name);
      } else {
        this.enable(ext.name);
      }
    }
  }

  public enable(name: string) {
    try {
      this.disabledExtensions.delete(name);
      options.set('disabledExtensions', [...this.disabledExtensions]);

      const ext = this.extensions.get(name)!;
      ext.enabled = true;
      ext.setup();

      logger.debug(`Enabled extension: ${name}`);
      this.signal.value++;
    } catch (err) {
      logger.error(`Failed to enable extension: ${name}`, err);
    }
  }

  public disable(name: string) {
    try {
      this.disabledExtensions.add(name);
      options.set('disabledExtensions', [...this.disabledExtensions]);

      const ext = this.extensions.get(name)!;
      ext.enabled = false;
      ext.dispose();

      logger.debug(`Disabled extension: ${name}`);
      this.signal.value++;
    } catch (err) {
      logger.error(`Failed to disable extension: ${name}`, err);
    }
  }

  public getExtensions() {
    return [...this.extensions.values()];
  }

  /**
   * Here we hooks the browser's XHR method to intercept Twitter's Web API calls.
   * This need to be done before any XHR request is made.
   */
  private installHttpHooks() {
    const manager = this;

    unsafeWindow.XMLHttpRequest.prototype.open = function (method: string, url: string) {
      // Get current enabled interceptors.
      const interceptors = manager
        .getExtensions()
        .filter((ext) => ext.enabled)
        .map((ext) => ext.intercept())
        .filter((int): int is Interceptor => typeof int === 'function');

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
