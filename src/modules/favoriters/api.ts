import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import { TimelineInstructions, User } from '@/types';
import logger from '@/utils/logger';
import { extractDataFromResponse, extractTimelineUser } from '@/utils/api';

interface FavoritersResponse {
  data: {
    favoriters_timeline: {
      timeline: {
        instructions: TimelineInstructions;
      };
    };
  };
}

export const FavoritersInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/Favoriters/.test(req.url)) {
    return;
  }

  try {
    const newData = extractDataFromResponse<FavoritersResponse, User>(
      res,
      (json) => json.data.favoriters_timeline.timeline.instructions,
      (entry) => extractTimelineUser(entry.content.itemContent),
    );

    // Add captured data to the database.
    db.extAddUsers(ext.name, newData);

    logger.info(`Favoriters: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('Favoriters: Failed to parse API response', err as Error);
  }
};
