import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import { TimelineInstructions, User } from '@/types';
import logger from '@/utils/logger';
import { extractDataFromResponse, extractTimelineUser } from '@/utils/api';

interface RetweetersResponse {
  data: {
    retweeters_timeline: {
      timeline: {
        instructions: TimelineInstructions;
      };
    };
  };
}

// https://twitter.com/i/api/graphql/IQ43ps3iEcdrGV_OL1QaRw/Retweeters
export const RetweetersInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/Retweeters/.test(req.url)) {
    return;
  }

  try {
    const newData = extractDataFromResponse<RetweetersResponse, User>(
      res,
      (json) => json.data.retweeters_timeline.timeline.instructions,
      (entry) => extractTimelineUser(entry.content.itemContent),
    );

    // Add captured data to the database.
    db.extAddUsers(ext.name, newData);

    logger.info(`Retweeters: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('Retweeters: Failed to parse API response', err as Error);
  }
};
