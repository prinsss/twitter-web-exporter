import { Extension } from '@/core/extensions';
import { TweetDetailInterceptor, tweetDetailSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { Tweet } from '@/types';

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
