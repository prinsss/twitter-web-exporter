import { AbstractModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { User } from '@/types';

import { ListMembersInterceptor, listMembersSignal } from './api';

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
