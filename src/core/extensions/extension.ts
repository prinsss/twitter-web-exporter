import { ComponentType } from 'preact';
import type { ExtensionManager } from './manager';

export interface ExtensionConstructor {
  new (manager: ExtensionManager): Extension;
}

/**
 * HTTP response interceptor.
 */
export type Interceptor = (
  request: Pick<Request, 'method' | 'url'>,
  response: XMLHttpRequest,
) => void;

/**
 * The base class for all extensions.
 */
export abstract class Extension {
  public name: string = '';
  public enabled = true;

  protected manager: ExtensionManager;

  constructor(manager: ExtensionManager) {
    this.manager = manager;
  }

  /**
   * Optionally run side effects when enabled.
   */
  public setup(): void {
    // noop
  }

  /**
   * Optionally clear side effects when disabled.
   */
  public dispose(): void {
    // noop
  }

  /**
   * Intercept HTTP responses.
   */
  public intercept(): Interceptor | null {
    return null;
  }

  /**
   * Render extension UI.
   */
  public render(): ComponentType | null {
    return null;
  }
}
