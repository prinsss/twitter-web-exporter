import { render } from 'preact';
import { App } from './core/app';
import extensions from './core/extensions';
import FollowersModule from './modules/followers';
import UserTweetsModule from './modules/user-tweets';

extensions.add(FollowersModule);
extensions.add(UserTweetsModule);

function mountApp() {
  const root = document.createElement('div');
  root.id = 'twitter-web-exporter-root';
  document.body.append(root);

  render(<App />, root);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
