import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { BookmarksInterceptor } from './api';

export default class BookmarksModule extends Extension {
  name = 'BookmarksModule';

  type = ExtensionType.TWEET;

  intercept() {
    return BookmarksInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
