import { Extension } from '@/core/extensions';
import { LikesInterceptor, likesSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { Tweet } from '@/types';

const ModuleUI = AbstractModuleUI<Tweet>;

function LikesPanel() {
  return <ModuleUI title="Likes" recordsSignal={likesSignal} />;
}

const LikesModule: Extension = {
  name: 'LikesModule',
  setup(ctx) {
    ctx.registerInterceptor(LikesInterceptor);
    ctx.registerPanel(LikesPanel);
  },
};

export default LikesModule;
