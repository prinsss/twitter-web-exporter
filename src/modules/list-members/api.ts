import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
import { TimelineInstructions, User } from '@/types';
import { extractDataFromResponse } from '@/utils/api';

/**
 * The global store for "ListMembers".
 */
export const listMembersSignal = signal<User[]>([]);

interface ListMembersResponse {
  data: {
    list: {
      members_timeline: {
        timeline: {
          instructions: TimelineInstructions;
        };
      };
    };
  };
}

// https://twitter.com/i/api/graphql/-5VwQkb7axZIxFkFS44iWw/ListMembers
export const ListMembersInterceptor: Interceptor = (req, res) => {
  if (!/api\/graphql\/.+\/ListMembers/.test(req.url)) {
    return;
  }

  extractDataFromResponse<ListMembersResponse, User>(
    res,
    (json) => json.data.list.members_timeline.timeline.instructions,
    (entry) => entry.content.itemContent.user_results.result,
    (newData) => {
      // Add captured data to the global store.
      listMembersSignal.value = [...listMembersSignal.value, ...newData];
    },
  );
};
