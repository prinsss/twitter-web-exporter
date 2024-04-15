import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import { TimelineInstructions, Tweet } from '@/types';
import { extractDataFromResponse, extractTimelineTweet } from '@/utils/api';
import logger from '@/utils/logger';

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
export const ListTimelineInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/ListLatestTweetsTimeline/.test(req.url)) {
    return;
  }

  try {
    const newData = extractDataFromResponse<ListTimelineResponse, Tweet>(
      res,
      (json) => json.data.list.tweets_timeline.timeline.instructions,
      (entry) => extractTimelineTweet(entry.content.itemContent),
    );

    // Add captured data to the database.
    db.extAddTweets(ext.name, newData);

    logger.info(`ListTimeline: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('ListTimeline: Failed to parse API response', err as Error);
  }
};
