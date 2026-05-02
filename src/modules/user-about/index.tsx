import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { UserAboutInterceptor } from './api';

export default class UserAboutModule extends Extension {
  name = 'UserAboutModule';

  type = ExtensionType.USER;

  intercept() {
    return UserAboutInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
