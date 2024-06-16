import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import { TimelineInstructions, User } from '@/types';
import { extractDataFromResponse, extractTimelineUser } from '@/utils/api';
import logger from '@/utils/logger';

interface ListSubscribersResponse {
  data: {
    list: {
      subscribers_timeline: {
        timeline: {
          instructions: TimelineInstructions;
        };
      };
    };
  };
}

// https://twitter.com/i/api/graphql/B9F2680qyuI6keStbcgv6w/ListSubscribers
export const ListSubscribersInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/ListSubscribers/.test(req.url)) {
    return;
  }

  try {
    const newData = extractDataFromResponse<ListSubscribersResponse, User>(
      res,
      (json) => json.data.list.subscribers_timeline.timeline.instructions,
      (entry) => extractTimelineUser(entry.content.itemContent),
    );

    // Add captured data to the database.
    db.extAddUsers(ext.name, newData);

    logger.info(`ListSubscribers: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('ListSubscribers: Failed to parse API response', err as Error);
  }
};
