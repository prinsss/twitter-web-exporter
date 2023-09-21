import { UserTweetsInterceptor } from './api';
import { Extension } from '@/core/extensions';
import { UserTweetsPanel } from './ui';

const UserTweetsModule: Extension = {
  name: 'UserTweetsModule',
  setup(ctx) {
    ctx.registerInterceptor(UserTweetsInterceptor);
    ctx.registerPanel(UserTweetsPanel);
  },
};

export default UserTweetsModule;
