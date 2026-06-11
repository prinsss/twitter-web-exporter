import { Extension, ExtensionType } from '@/core/extensions';
import { DirectMessagesInterceptor } from './api';
import { DirectMessagesUI } from './ui';
import {
  installEncryptedDmHook,
  loadPersistedMessages,
  setEncryptedDmCapturing,
} from './encrypted-dm';

export default class DirectMessagesModule extends Extension {
  name = 'DirectMessagesModule';

  type = ExtensionType.CUSTOM;

  setup() {
    // Restore previously captured messages so they survive page reloads.
    loadPersistedMessages();
    // Legacy DMs are captured via the XHR interceptor below. The new encrypted
    // DMs are captured by passively hooking the SQLite Web Worker.
    installEncryptedDmHook();
    setEncryptedDmCapturing(true);
  }

  dispose() {
    setEncryptedDmCapturing(false);
  }

  intercept() {
    return DirectMessagesInterceptor;
  }

  render() {
    return DirectMessagesUI;
  }
}
