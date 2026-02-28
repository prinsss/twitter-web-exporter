import { Extension, ExtensionType } from '@/core/extensions';
import { BlueskyUserPostsInterceptor } from './api';
import { BlueskyUserPostsUI } from './ui';

export default class BlueskyUserPostsModule extends Extension {
  name = 'BlueskyUserPostsModule';

  type = ExtensionType.BLUESKY_POST;

  intercept() {
    return BlueskyUserPostsInterceptor;
  }

  render() {
    return BlueskyUserPostsUI;
  }
}
