import { AbstractModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { Tweet } from '@/types';

import { LikesInterceptor, likesSignal } from './api';

const ModuleUI = AbstractModuleUI<Tweet>;

function LikesPanel() {
  return <ModuleUI title="Likes" recordsSignal={likesSignal} isTweet />;
}

export default class LikesModule extends Extension {
  name = 'LikesModule';

  intercept() {
    return LikesInterceptor;
  }

  render() {
    return LikesPanel;
  }
}
