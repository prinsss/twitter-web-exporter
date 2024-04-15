import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { LikesInterceptor } from './api';

export default class LikesModule extends Extension {
  name = 'LikesModule';

  type = ExtensionType.TWEET;

  intercept() {
    return LikesInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
