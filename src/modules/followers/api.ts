import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import { TimelineInstructions, User } from '@/types';
import { extractDataFromResponse, extractTimelineUser } from '@/utils/api';
import logger from '@/utils/logger';

interface FollowersResponse {
  data: {
    user: {
      result: {
        timeline: {
          timeline: {
            instructions: TimelineInstructions;
          };
        };
        __typename: 'User';
      };
    };
  };
}

// https://twitter.com/i/api/graphql/rRXFSG5vR6drKr5M37YOTw/Followers
// https://twitter.com/i/api/graphql/kXi37EbqWokFUNypPHhQDQ/BlueVerifiedFollowers
export const FollowersInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/(BlueVerified)*Followers/.test(req.url)) {
    return;
  }

  try {
    const newData = extractDataFromResponse<FollowersResponse, User>(
      res,
      (json) => json.data.user.result.timeline.timeline.instructions,
      (entry) => extractTimelineUser(entry.content.itemContent),
    );

    // Add captured data to the database.
    db.extAddUsers(ext.name, newData);

    logger.info(`Followers: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('Followers: Failed to parse API response', err as Error);
  }
};
