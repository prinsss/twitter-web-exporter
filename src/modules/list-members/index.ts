import { Extension } from '@/core/extensions';
import { ListMembersInterceptor } from './api';
import { ListMembersPanel } from './ui';

const ListMembersModule: Extension = {
  name: 'ListMembersModule',
  setup(ctx) {
    ctx.registerInterceptor(ListMembersInterceptor);
    ctx.registerPanel(ListMembersPanel);
  },
};

export default ListMembersModule;
