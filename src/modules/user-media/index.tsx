import { ModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { Tweet } from '@/types';
import { UserMediaInterceptor, userMediaSignal } from './api';

function UserMediaPanel() {
  return <ModuleUI<Tweet> title="UserMedia" recordsSignal={userMediaSignal} isTweet />;
}

export default class UserMediaModule extends Extension {
  name = 'UserMediaModule';

  intercept() {
    return UserMediaInterceptor;
  }

  render() {
    return UserMediaPanel;
  }
}
