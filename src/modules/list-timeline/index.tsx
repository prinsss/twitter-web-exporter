import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { ListTimelineInterceptor } from './api';

export default class ListTimelineModule extends Extension {
  name = 'ListTimelineModule';

  type = ExtensionType.TWEET;

  intercept() {
    return ListTimelineInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
