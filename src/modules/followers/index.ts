import logger from '@/utils/logger';
import { Extension } from '@/core/extensions';
import { FollowersInterceptor } from './data';
import { FollowersPanel } from './ui';

const FollowersModule: Extension = {
  name: 'followers',
  setup(ctx) {
    logger.debug('FollowersModule setup');

    ctx.registerInterceptor(FollowersInterceptor);
    ctx.registerPanel(FollowersPanel);
  },
};

export default FollowersModule;
