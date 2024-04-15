import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { FollowingInterceptor } from './api';

export default class FollowingModule extends Extension {
  name = 'FollowingModule';

  type = ExtensionType.USER;

  intercept() {
    return FollowingInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
