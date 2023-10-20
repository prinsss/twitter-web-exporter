import { ModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { Tweet } from '@/types';
import { UserTweetsInterceptor, userTweetsSignal } from './api';

function UserTweetsPanel() {
  return <ModuleUI<Tweet> title="UserTweets" recordsSignal={userTweetsSignal} isTweet />;
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
