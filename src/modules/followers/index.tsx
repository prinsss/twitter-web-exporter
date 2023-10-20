import { ModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { User } from '@/types';
import { FollowersInterceptor, followersSignal } from './api';

function FollowersPanel() {
  return <ModuleUI<User> title="Followers" recordsSignal={followersSignal} />;
}

export default class FollowersModule extends Extension {
  name = 'FollowersModule';

  intercept() {
    return FollowersInterceptor;
  }

  render() {
    return FollowersPanel;
  }
}
