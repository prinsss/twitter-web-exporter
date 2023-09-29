import { signal } from '@preact/signals';

import { Interceptor } from '@/core/extensions';
import { TimelineInstructions, User } from '@/types';
import { extractDataFromResponse } from '@/utils/api';
import logger from '@/utils/logger';

/**
 * The global store for "Followers".
 */
export const followersSignal = signal<User[]>([]);

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
export const FollowersInterceptor: Interceptor = (req, res) => {
  if (!/api\/graphql\/.+\/(BlueVerified)*Followers/.test(req.url)) {
    return;
  }

  try {
    const newData = extractDataFromResponse<FollowersResponse, User>(
      res,
      (json) => json.data.user.result.timeline.timeline.instructions,
      (entry) => entry.content.itemContent.user_results.result,
    );

    // Add captured data to the global store.
    followersSignal.value = [...followersSignal.value, ...newData];

    logger.info(`Followers: ${newData.length} items received`);
  } catch (err) {
    logger.errorWithBanner('Followers: Failed to parse API response', err as Error);
  }
};
