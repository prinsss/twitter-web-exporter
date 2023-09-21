import { listMembersSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { User } from '@/types';

const ModuleUI = AbstractModuleUI<User>;

export function ListMembersPanel() {
  return <ModuleUI title="ListMembers" recordsSignal={listMembersSignal} />;
}
