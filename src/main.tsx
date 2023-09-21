import { render } from 'preact';
import { App } from './core/app';
import extensions from './core/extensions';
import './index.css';

import BookmarksModule from './modules/bookmarks';
import FollowersModule from './modules/followers';
import FollowingModule from './modules/following';
import LikesModule from './modules/likes';
import ListMembersModule from './modules/list-members';
import ListSubscribersModule from './modules/list-subscribers';
import RuntimeLogsModule from './modules/runtime-logs';
import UserTweetsModule from './modules/user-tweets';

extensions.add(BookmarksModule);
extensions.add(LikesModule);
extensions.add(FollowersModule);
extensions.add(FollowingModule);
extensions.add(UserTweetsModule);
extensions.add(ListMembersModule);
extensions.add(ListSubscribersModule);
extensions.add(RuntimeLogsModule);

function mountApp() {
  const root = document.createElement('div');
  root.id = 'twe-root';
  document.body.append(root);

  render(<App />, root);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
