import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
import { TimelineInstructions, User } from '@/types';
import { extractDataFromResponse } from '@/utils/api';

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
  if (!/api\/graphql\/.+\/Following/.test(req.url)) {
    return;
  }

  extractDataFromResponse<FollowingResponse, User>(
    res,
    (json) => json.data.user.result.timeline.timeline.instructions,
    (entry) => entry.content.itemContent.user_results.result,
    (newData) => {
      // Add captured data to the global store.
      followingSignal.value = [...followingSignal.value, ...newData];
    },
  );
};
