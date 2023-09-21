import { Extension } from '@/core/extensions';
import { ListSubscribersInterceptor } from './api';
import { ListSubscribersPanel } from './ui';

const ListSubscribersModule: Extension = {
  name: 'ListSubscribersModule',
  setup(ctx) {
    ctx.registerInterceptor(ListSubscribersInterceptor);
    ctx.registerPanel(ListSubscribersPanel);
  },
};

export default ListSubscribersModule;
