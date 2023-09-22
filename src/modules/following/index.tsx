import { Extension } from '@/core/extensions';
import { FollowingInterceptor, followingSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { User } from '@/types';

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
