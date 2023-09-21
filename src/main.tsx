import { render } from 'preact';
import { App } from './core/app';
import extensions from './core/extensions';
import FollowersModule from './modules/followers';
import FollowingModule from './modules/following';
import UserTweetsModule from './modules/user-tweets';
import RuntimeLogsModule from './modules/runtime-logs';
import ListMembersModule from './modules/list-members';
import ListSubscribersModule from './modules/list-subscribers';
import './index.css';

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
