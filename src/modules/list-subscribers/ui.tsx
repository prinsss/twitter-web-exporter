import { listSubscribersSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { User } from '@/types';

const ModuleUI = AbstractModuleUI<User>;

export function ListSubscribersPanel() {
  return <ModuleUI title="ListSubscribers" recordsSignal={listSubscribersSignal} />;
}
