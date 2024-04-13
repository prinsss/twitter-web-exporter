import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
import { TimelineInstructions, Tweet } from '@/types';
import { extractDataFromResponse, extractTimelineTweet } from '@/utils/api';
import logger from '@/utils/logger';

/**
 * The global store for "ListTimeline".
 */
export const listTimelineSignal = signal<Tweet[]>([]);

interface ListTimelineResponse {
  data: {
    list: {
      tweets_timeline: {
        timeline: {
          instructions: TimelineInstructions;
          metadata: unknown;
        };
      };
    };
  };
}

// https://twitter.com/i/api/graphql/asz3yj2ZCgJt3pdZEY2zgA/ListLatestTweetsTimeline
export const ListTimelineInterceptor: Interceptor = (req, res) => {
  if (!/\/graphql\/.+\/ListLatestTweetsTimeline/.test(req.url)) {
    return;
  }

  try {
    const newData = extractDataFromResponse<ListTimelineResponse, Tweet>(
      res,
      (json) => json.data.list.tweets_timeline.timeline.instructions,
      (entry) => extractTimelineTweet(entry.content.itemContent),
    );

    // Add captured data to the global store.
    listTimelineSignal.value = [...listTimelineSignal.value, ...newData];

    logger.info(`ListTimeline: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('ListTimeline: Failed to parse API response', err as Error);
  }
};
