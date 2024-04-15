import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { ListMembersInterceptor } from './api';

export default class ListMembersModule extends Extension {
  name = 'ListMembersModule';

  type = ExtensionType.USER;

  intercept() {
    return ListMembersInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
