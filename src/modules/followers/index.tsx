import { AbstractModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { User } from '@/types';

import { FollowersInterceptor, followersSignal } from './api';

const ModuleUI = AbstractModuleUI<User>;

function FollowersPanel() {
  return <ModuleUI title="Followers" recordsSignal={followersSignal} />;
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
