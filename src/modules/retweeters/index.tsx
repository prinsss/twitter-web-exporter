import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { RetweetersInterceptor } from './api';

export default class RetweetersModule extends Extension {
  name = 'RetweetersModule';

  type = ExtensionType.USER;

  intercept() {
    return RetweetersInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
