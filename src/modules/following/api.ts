import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
import { TimelineInstructions, User } from '@/types';
import { extractDataFromResponse } from '@/utils/api';
import logger from '@/utils/logger';

/**
 * The global store for "Following".
 */
export const followingSignal = signal<User[]>([]);

interface FollowingResponse {
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

// https://twitter.com/i/api/graphql/iSicc7LrzWGBgDPL0tM_TQ/Following
export const FollowingInterceptor: Interceptor = (req, res) => {
  if (!/\/graphql\/.+\/Following/.test(req.url)) {
    return;
  }

  try {
    const extractedData = extractDataFromResponse<FollowingResponse, User>(
      res,
      (json) => json.data.user.result.timeline.timeline.instructions,
      (entry) => entry.content.itemContent.user_results.result,
    );

    // Filter out non-User objects from the extracted data
    const newData = extractedData.filter((user) => user.__typename === 'User');
    // Add captured data to the global store.
    followingSignal.value = [...followingSignal.value, ...newData];

    logger.info(`Following: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('Following: Failed to parse API response', err as Error);
  }
};
