import { bookmarksSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { Tweet } from '@/types';

const ModuleUI = AbstractModuleUI<Tweet>;

export function BookmarksPanel() {
  return <ModuleUI title="Bookmarks" recordsSignal={bookmarksSignal} />;
}
