import { AbstractModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { Tweet } from '@/types';

import { BookmarksInterceptor, bookmarksSignal } from './api';

const ModuleUI = AbstractModuleUI<Tweet>;

function BookmarksPanel() {
  return <ModuleUI title="Bookmarks" recordsSignal={bookmarksSignal} isTweet />;
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
