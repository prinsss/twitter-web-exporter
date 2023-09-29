import { AbstractModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { Tweet } from '@/types';

import { TweetDetailInterceptor, tweetDetailSignal } from './api';

const ModuleUI = AbstractModuleUI<Tweet>;

function TweetDetailPanel() {
  return <ModuleUI title="TweetDetail" recordsSignal={tweetDetailSignal} isTweet />;
}

export default class TweetDetailModule extends Extension {
  name = 'TweetDetailModule';

  intercept() {
    return TweetDetailInterceptor;
  }

  render() {
    return TweetDetailPanel;
  }
}
