import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { UserDetailInterceptor } from './api';

export default class UserDetailModule extends Extension {
  name = 'UserDetailModule';

  type = ExtensionType.USER;

  intercept() {
    return UserDetailInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
