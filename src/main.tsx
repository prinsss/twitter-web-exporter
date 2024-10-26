import { render } from 'preact';
import { App } from './core/app';
import extensions from './core/extensions';

import BookmarksModule from './modules/bookmarks';
import DirectMessagesModule from './modules/direct-messages';
import FollowersModule from './modules/followers';
import FollowingModule from './modules/following';
import HomeTimelineModule from './modules/home-timeline';
import LikesModule from './modules/likes';
import ListMembersModule from './modules/list-members';
import ListSubscribersModule from './modules/list-subscribers';
import ListTimelineModule from './modules/list-timeline';
import RuntimeLogsModule from './modules/runtime-logs';
import SearchTimelineModule from './modules/search-timeline';
import TweetDetailModule from './modules/tweet-detail';
import UserDetailModule from './modules/user-detail';
import UserMediaModule from './modules/user-media';
import UserTweetsModule from './modules/user-tweets';

import './index.css';

extensions.add(FollowersModule);
extensions.add(FollowingModule);
extensions.add(UserDetailModule);
extensions.add(ListMembersModule);
extensions.add(ListSubscribersModule);
extensions.add(HomeTimelineModule);
extensions.add(ListTimelineModule);
extensions.add(BookmarksModule);
extensions.add(LikesModule);
extensions.add(UserTweetsModule);
extensions.add(UserMediaModule);
extensions.add(TweetDetailModule);
extensions.add(SearchTimelineModule);
extensions.add(DirectMessagesModule);
extensions.add(RuntimeLogsModule);
extensions.start();

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
