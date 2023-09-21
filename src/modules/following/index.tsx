import { Extension } from '@/core/extensions';
import { FollowingInterceptor, followingSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { User } from '@/types';

const ModuleUI = AbstractModuleUI<User>;

function FollowingPanel() {
  return <ModuleUI title="Following" recordsSignal={followingSignal} />;
}

const FollowingModule: Extension = {
  name: 'FollowingModule',
  setup(ctx) {
    ctx.registerInterceptor(FollowingInterceptor);
    ctx.registerPanel(FollowingPanel);
  },
};

export default FollowingModule;
