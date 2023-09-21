import { Extension } from '@/core/extensions';
import { FollowingInterceptor } from './api';
import { FollowingPanel } from './ui';

const FollowingModule: Extension = {
  name: 'FollowingModule',
  setup(ctx) {
    ctx.registerInterceptor(FollowingInterceptor);
    ctx.registerPanel(FollowingPanel);
  },
};

export default FollowingModule;
