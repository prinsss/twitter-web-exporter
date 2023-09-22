import { Extension } from '@/core/extensions';
import { LikesInterceptor, likesSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { Tweet } from '@/types';

const ModuleUI = AbstractModuleUI<Tweet>;

function LikesPanel() {
  return <ModuleUI title="Likes" recordsSignal={likesSignal} />;
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
