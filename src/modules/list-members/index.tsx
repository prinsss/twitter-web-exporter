import { Extension } from '@/core/extensions';
import { ListMembersInterceptor, listMembersSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { User } from '@/types';

const ModuleUI = AbstractModuleUI<User>;

function ListMembersPanel() {
  return <ModuleUI title="ListMembers" recordsSignal={listMembersSignal} />;
}

const ListMembersModule: Extension = {
  name: 'ListMembersModule',
  setup(ctx) {
    ctx.registerInterceptor(ListMembersInterceptor);
    ctx.registerPanel(ListMembersPanel);
  },
};

export default ListMembersModule;
