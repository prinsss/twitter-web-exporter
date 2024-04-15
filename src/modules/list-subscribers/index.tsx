import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { ListSubscribersInterceptor } from './api';

export default class ListSubscribersModule extends Extension {
  name = 'ListSubscribersModule';

  type = ExtensionType.USER;

  intercept() {
    return ListSubscribersInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
