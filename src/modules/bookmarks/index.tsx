import { Extension } from '@/core/extensions';
import { BookmarksInterceptor, bookmarksSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { Tweet } from '@/types';

const ModuleUI = AbstractModuleUI<Tweet>;

function BookmarksPanel() {
  return <ModuleUI title="Bookmarks" recordsSignal={bookmarksSignal} />;
}

export default class BookmarksModule extends Extension {
  name = 'BookmarksModule';

  intercept() {
    return BookmarksInterceptor;
  }

  render() {
    return BookmarksPanel;
  }
}
