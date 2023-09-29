import { AbstractModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { User } from '@/types';

import { ListSubscribersInterceptor, listSubscribersSignal } from './api';

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
