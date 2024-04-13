import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
import { TimelineInstructions, Tweet } from '@/types';
import { extractDataFromResponse, extractTimelineTweet } from '@/utils/api';
import logger from '@/utils/logger';

/**
 * The global store for "HomeTimeline".
 */
export const homeTimelineSignal = signal<Tweet[]>([]);

interface HomeTimelineResponse {
  data: {
    home: {
      home_timeline_urt: {
        instructions: TimelineInstructions;
        metadata: unknown;
        responseObjects: unknown;
      };
    };
  };
}

// https://twitter.com/i/api/graphql/uPv755D929tshj6KsxkSZg/HomeTimeline
// https://twitter.com/i/api/graphql/70b_oNkcK9IEN13WNZv8xA/HomeLatestTimeline
export const HomeTimelineInterceptor: Interceptor = (req, res) => {
  if (!/\/graphql\/.+\/Home(Latest)?Timeline/.test(req.url)) {
    return;
  }

  try {
    const newData = extractDataFromResponse<HomeTimelineResponse, Tweet>(
      res,
      (json) => json.data.home.home_timeline_urt.instructions,
      (entry) => extractTimelineTweet(entry.content.itemContent),
    );

    // Add captured data to the global store.
    homeTimelineSignal.value = [...homeTimelineSignal.value, ...newData];

    logger.info(`HomeTimeline: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('HomeTimeline: Failed to parse API response', err as Error);
  }
};
