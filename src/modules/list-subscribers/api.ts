import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
import { TimelineInstructions, User } from '@/types';
import { extractDataFromResponse } from '@/utils/api';

/**
 * The global store for "ListSubscribers".
 */
export const listSubscribersSignal = signal<User[]>([]);

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
export const ListSubscribersInterceptor: Interceptor = (req, res) => {
  if (!/api\/graphql\/.+\/ListSubscribers/.test(req.url)) {
    return;
  }

  extractDataFromResponse<ListSubscribersResponse, User>(
    res,
    (json) => json.data.list.subscribers_timeline.timeline.instructions,
    (entry) => entry.content.itemContent.user_results.result,
    (newData) => {
      // Add captured data to the global store.
      listSubscribersSignal.value = [...listSubscribersSignal.value, ...newData];
    },
  );
};
