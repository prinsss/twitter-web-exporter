import { Extension, ExtensionType } from '@/core/extensions';
import { DirectMessagesInterceptor } from './api';
import { DirectMessagesUI } from './ui';

export default class DirectMessagesModule extends Extension {
  name = 'DirectMessagesModule';

  type = ExtensionType.CUSTOM;

  intercept() {
    return DirectMessagesInterceptor;
  }

  render() {
    return DirectMessagesUI;
  }
}
