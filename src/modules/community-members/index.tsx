import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { CommunityMembersInterceptor } from './api';

export default class CommunityMembersModule extends Extension {
  name = 'CommunityMembersModule';

  type = ExtensionType.USER;

  intercept() {
    return CommunityMembersInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
