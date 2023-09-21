import { Extension } from '@/core/extensions';
import { BookmarksInterceptor } from './api';
import { BookmarksPanel } from './ui';

const BookmarksModule: Extension = {
  name: 'BookmarksModule',
  setup(ctx) {
    ctx.registerInterceptor(BookmarksInterceptor);
    ctx.registerPanel(BookmarksPanel);
  },
};

export default BookmarksModule;
