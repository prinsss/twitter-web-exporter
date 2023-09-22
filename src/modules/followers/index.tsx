import { Extension } from '@/core/extensions';
import { FollowersInterceptor, followersSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { User } from '@/types';

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
