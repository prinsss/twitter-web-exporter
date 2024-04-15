import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { SearchTimelineInterceptor } from './api';

export default class SearchTimelineModule extends Extension {
  name = 'SearchTimelineModule';

  type = ExtensionType.TWEET;

  intercept() {
    return SearchTimelineInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
