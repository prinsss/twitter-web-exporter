import { ModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { Tweet } from '@/types';
import { TweetDetailInterceptor, tweetDetailSignal } from './api';

function TweetDetailPanel() {
  return <ModuleUI<Tweet> title="TweetDetail" recordsSignal={tweetDetailSignal} isTweet />;
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
