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

import styles from './index.css?inline';

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

  // Use shadow DOM to avoid CSS conflicts.
  const shadowRoot = root.attachShadow({ mode: 'open' });
  shadowRoot.adoptedStyleSheets = [prepareStyles()];

  render(<App />, shadowRoot);
}

// To use Tailwind CSS v4 in shadow DOM,
// See: https://github.com/tailwindlabs/tailwindcss/issues/15005
function prepareStyles() {
  const shadowSheet = new CSSStyleSheet();
  shadowSheet.replaceSync(styles.replace(/:root/gu, ':host'));

  const globalSheet = new CSSStyleSheet();
  for (const rule of shadowSheet.cssRules) {
    if (rule instanceof CSSPropertyRule) {
      globalSheet.insertRule(rule.cssText);
    }
  }

  document.adoptedStyleSheets.push(globalSheet);
  return shadowSheet;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
