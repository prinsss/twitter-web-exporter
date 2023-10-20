import { ModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { User } from '@/types';
import { ListMembersInterceptor, listMembersSignal } from './api';

function ListMembersPanel() {
  return <ModuleUI<User> title="ListMembers" recordsSignal={listMembersSignal} />;
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
