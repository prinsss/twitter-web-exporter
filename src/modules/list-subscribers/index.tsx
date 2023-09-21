import { Extension } from '@/core/extensions';
import { ListSubscribersInterceptor, listSubscribersSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { User } from '@/types';

const ModuleUI = AbstractModuleUI<User>;

function ListSubscribersPanel() {
  return <ModuleUI title="ListSubscribers" recordsSignal={listSubscribersSignal} />;
}

const ListSubscribersModule: Extension = {
  name: 'ListSubscribersModule',
  setup(ctx) {
    ctx.registerInterceptor(ListSubscribersInterceptor);
    ctx.registerPanel(ListSubscribersPanel);
  },
};

export default ListSubscribersModule;
