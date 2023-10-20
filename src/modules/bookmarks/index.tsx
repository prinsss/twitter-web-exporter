import { ModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { Tweet } from '@/types';
import { BookmarksInterceptor, bookmarksSignal } from './api';

function BookmarksPanel() {
  return <ModuleUI<Tweet> title="Bookmarks" recordsSignal={bookmarksSignal} isTweet />;
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
