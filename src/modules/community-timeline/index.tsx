import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { CommunityTimelineInterceptor } from './api';

export default class CommunityTimelineModule extends Extension {
  name = 'CommunityTimelineModule';

  type = ExtensionType.TWEET;

  intercept() {
    return CommunityTimelineInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
