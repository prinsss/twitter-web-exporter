import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { UserTweetsInterceptor } from './api';

export default class UserTweetsModule extends Extension {
  name = 'UserTweetsModule';

  type = ExtensionType.TWEET;

  intercept() {
    return UserTweetsInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
