import { followersSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { User } from '@/types';

const ModuleUI = AbstractModuleUI<User>;

export function FollowersPanel() {
  return <ModuleUI title="Followers" recordsSignal={followersSignal} />;
}
