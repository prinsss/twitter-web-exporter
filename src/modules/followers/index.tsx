import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { FollowersInterceptor } from './api';

export default class FollowersModule extends Extension {
  name = 'FollowersModule';

  type = ExtensionType.USER;

  intercept() {
    return FollowersInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
