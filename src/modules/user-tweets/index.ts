import logger from '@/utils/logger';
import { UserTweetsInterceptor } from './data';
import { Extension } from '@/core/extensions';
import { UserTweetsPanel } from './ui';

const UserTweetsModule: Extension = {
  name: 'user-tweets',
  setup(ctx) {
    logger.debug('UserTweetsModule setup');

    ctx.registerInterceptor(UserTweetsInterceptor);
    ctx.registerPanel(UserTweetsPanel);
  },
};

export default UserTweetsModule;
