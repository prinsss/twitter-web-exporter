import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { TweetDetailInterceptor } from './api';

export default class TweetDetailModule extends Extension {
  name = 'TweetDetailModule';

  type = ExtensionType.TWEET;

  intercept() {
    return TweetDetailInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
