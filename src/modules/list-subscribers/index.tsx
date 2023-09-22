import { Extension } from '@/core/extensions';
import { ListSubscribersInterceptor, listSubscribersSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { User } from '@/types';

const ModuleUI = AbstractModuleUI<User>;

function ListSubscribersPanel() {
  return <ModuleUI title="ListSubscribers" recordsSignal={listSubscribersSignal} />;
}

export default class ListSubscribersModule extends Extension {
  name = 'ListSubscribersModule';

  intercept() {
    return ListSubscribersInterceptor;
  }

  render() {
    return ListSubscribersPanel;
  }
}
