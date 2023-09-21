import { Extension } from '@/core/extensions';
import { LikesInterceptor } from './api';
import { LikesPanel } from './ui';

const LikesModule: Extension = {
  name: 'LikesModule',
  setup(ctx) {
    ctx.registerInterceptor(LikesInterceptor);
    ctx.registerPanel(LikesPanel);
  },
};

export default LikesModule;
