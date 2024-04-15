import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { HomeTimelineInterceptor } from './api';

export default class HomeTimelineModule extends Extension {
  name = 'HomeTimelineModule';

  type = ExtensionType.TWEET;

  intercept() {
    return HomeTimelineInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
