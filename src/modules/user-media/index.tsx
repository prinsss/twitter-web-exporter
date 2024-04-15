import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { UserMediaInterceptor } from './api';

export default class UserMediaModule extends Extension {
  name = 'UserMediaModule';

  type = ExtensionType.TWEET;

  intercept() {
    return UserMediaInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
