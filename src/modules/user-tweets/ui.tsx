import { userTweetsSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { Tweet } from '@/types';

const ModuleUI = AbstractModuleUI<Tweet>;

export function UserTweetsPanel() {
  return <ModuleUI title="UserTweets" recordsSignal={userTweetsSignal} />;
}
