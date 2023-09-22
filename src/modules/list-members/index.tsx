import { Extension } from '@/core/extensions';
import { ListMembersInterceptor, listMembersSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { User } from '@/types';

const ModuleUI = AbstractModuleUI<User>;

function ListMembersPanel() {
  return <ModuleUI title="ListMembers" recordsSignal={listMembersSignal} />;
}

export default class ListMembersModule extends Extension {
  name = 'ListMembersModule';

  intercept() {
    return ListMembersInterceptor;
  }

  render() {
    return ListMembersPanel;
  }
}
