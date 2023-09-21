import { Extension } from '@/core/extensions';
import { FollowersInterceptor, followersSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { User } from '@/types';

const ModuleUI = AbstractModuleUI<User>;

function FollowersPanel() {
  return <ModuleUI title="Followers" recordsSignal={followersSignal} />;
}

const FollowersModule: Extension = {
  name: 'FollowersModule',
  setup(ctx) {
    ctx.registerInterceptor(FollowersInterceptor);
    ctx.registerPanel(FollowersPanel);
  },
};

export default FollowersModule;
