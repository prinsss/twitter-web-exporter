import { Extension } from '@/core/extensions';
import { BookmarksInterceptor, bookmarksSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { Tweet } from '@/types';

const ModuleUI = AbstractModuleUI<Tweet>;

function BookmarksPanel() {
  return <ModuleUI title="Bookmarks" recordsSignal={bookmarksSignal} />;
}

const BookmarksModule: Extension = {
  name: 'BookmarksModule',
  setup(ctx) {
    ctx.registerInterceptor(BookmarksInterceptor);
    ctx.registerPanel(BookmarksPanel);
  },
};

export default BookmarksModule;
