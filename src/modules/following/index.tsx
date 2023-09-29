import { AbstractModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { User } from '@/types';

import { FollowingInterceptor, followingSignal } from './api';

const ModuleUI = AbstractModuleUI<User>;

function FollowingPanel() {
  return <ModuleUI title="Following" recordsSignal={followingSignal} />;
}

export default class FollowingModule extends Extension {
  name = 'FollowingModule';

  intercept() {
    return FollowingInterceptor;
  }

  render() {
    return FollowingPanel;
  }
}
