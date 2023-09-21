import { Extension } from '@/core/extensions';
import { FollowersInterceptor } from './api';
import { FollowersPanel } from './ui';

const FollowersModule: Extension = {
  name: 'FollowersModule',
  setup(ctx) {
    ctx.registerInterceptor(FollowersInterceptor);
    ctx.registerPanel(FollowersPanel);
  },
};

export default FollowersModule;
