import { ModuleUI } from '@/components/module-ui';
import { Extension } from '@/core/extensions';
import { Tweet } from '@/types';
import { SearchTimelineInterceptor, searchTimelineSignal } from './api';

function SearchTimelinePanel() {
  return <ModuleUI<Tweet> title="SearchTimeline" recordsSignal={searchTimelineSignal} isTweet />;
}

export default class SearchTimelineModule extends Extension {
  name = 'SearchTimelineModule';

  intercept() {
    return SearchTimelineInterceptor;
  }

  render() {
    return SearchTimelinePanel;
  }
}
