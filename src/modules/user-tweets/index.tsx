import { Extension } from '@/core/extensions';
import { UserTweetsInterceptor, userTweetsSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { Tweet } from '@/types';

const ModuleUI = AbstractModuleUI<Tweet>;

function UserTweetsPanel() {
  return <ModuleUI title="UserTweets" recordsSignal={userTweetsSignal} />;
}

const UserTweetsModule: Extension = {
  name: 'UserTweetsModule',
  setup(ctx) {
    ctx.registerInterceptor(UserTweetsInterceptor);
    ctx.registerPanel(UserTweetsPanel);
  },
};

export default UserTweetsModule;
