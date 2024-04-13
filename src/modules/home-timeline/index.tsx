import { ModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { Tweet } from '@/types';
import { HomeTimelineInterceptor, homeTimelineSignal } from './api';

function HomeTimelinePanel() {
  return <ModuleUI<Tweet> title="HomeTimeline" recordsSignal={homeTimelineSignal} isTweet />;
}

export default class HomeTimelineModule extends Extension {
  name = 'HomeTimelineModule';

  intercept() {
    return HomeTimelineInterceptor;
  }

  render() {
    return HomeTimelinePanel;
  }
}
