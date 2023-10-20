import { ModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { User } from '@/types';
import { ListSubscribersInterceptor, listSubscribersSignal } from './api';

function ListSubscribersPanel() {
  return <ModuleUI<User> title="ListSubscribers" recordsSignal={listSubscribersSignal} />;
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
