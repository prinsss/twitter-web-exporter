import { followingSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { User } from '@/types';

const ModuleUI = AbstractModuleUI<User>;

export function FollowingPanel() {
  return <ModuleUI title="Following" recordsSignal={followingSignal} />;
}
