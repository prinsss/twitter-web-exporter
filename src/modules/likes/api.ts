import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import { TimelineInstructions, Tweet } from '@/types';
import { extractDataFromResponse, extractTimelineTweet } from '@/utils/api';
import logger from '@/utils/logger';

interface LikesResponse {
  data: {
    user: {
      result: {
        timeline: {
          timeline: {
            instructions: TimelineInstructions;
            responseObjects: unknown;
          };
        };
        __typename: 'User';
      };
    };
  };
}

// https://twitter.com/i/api/graphql/lVf2NuhLoYVrpN4nO7uw0Q/Likes
export const LikesInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/Likes/.test(req.url)) {
    return;
  }

  try {
    const newData = extractDataFromResponse<LikesResponse, Tweet>(
      res,
      (json) => json.data.user.result.timeline.timeline.instructions,
      (entry) => extractTimelineTweet(entry.content.itemContent),
    );

    // Add captured data to the database.
    db.extAddTweets(ext.name, newData);

    logger.info(`Likes: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('Likes: Failed to parse API response', err as Error);
  }
};
