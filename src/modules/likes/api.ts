import { signal } from '@preact/signals';

import { Interceptor } from '@/core/extensions';
import { TimelineInstructions, Tweet } from '@/types';
import { extractDataFromResponse, extractTweetWithVisibility } from '@/utils/api';
import logger from '@/utils/logger';

/**
 * The global store for "Likes".
 */
export const likesSignal = signal<Tweet[]>([]);

interface LikesResponse {
  data: {
    user: {
      result: {
        timeline_v2: {
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
export const LikesInterceptor: Interceptor = (req, res) => {
  if (!/api\/graphql\/.+\/Likes/.test(req.url)) {
    return;
  }

  try {
    const newData = extractDataFromResponse<LikesResponse, Tweet>(
      res,
      (json) => json.data.user.result.timeline_v2.timeline.instructions,
      (entry) => extractTweetWithVisibility(entry.content.itemContent),
    );

    // Add captured data to the global store.
    likesSignal.value = [...likesSignal.value, ...newData];

    logger.info(`Likes: ${newData.length} items received`);
  } catch (err) {
    logger.errorWithBanner('Likes: Failed to parse API response', err as Error);
  }
};
