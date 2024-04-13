import { ModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { Tweet } from '@/types';
import { ListTimelineInterceptor, listTimelineSignal } from './api';

function ListTimelinePanel() {
  return <ModuleUI<Tweet> title="ListTimeline" recordsSignal={listTimelineSignal} isTweet />;
}

export default class ListTimelineModule extends Extension {
  name = 'ListTimelineModule';

  intercept() {
    return ListTimelineInterceptor;
  }

  render() {
    return ListTimelinePanel;
  }
}
