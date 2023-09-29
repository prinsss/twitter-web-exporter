import { AbstractModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { Tweet } from '@/types';

import { UserTweetsInterceptor, userTweetsSignal } from './api';

const ModuleUI = AbstractModuleUI<Tweet>;

function UserTweetsPanel() {
  return <ModuleUI title="UserTweets" recordsSignal={userTweetsSignal} isTweet />;
}

export default class UserTweetsModule extends Extension {
  name = 'UserTweetsModule';

  intercept() {
    return UserTweetsInterceptor;
  }

  render() {
    return UserTweetsPanel;
  }
}
