import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
import { TimelineInstructions, User } from '@/types';
import { extractDataFromResponse } from '@/utils/api';
import logger from '@/utils/logger';

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

  const newData = extractDataFromResponse<ListMembersResponse, User>(
    res,
    (json) => json.data.list.members_timeline.timeline.instructions,
    (entry) => entry.content.itemContent.user_results.result,
  );

  logger.info(`ListMembers: ${newData.length} items received`);

  // Add captured data to the global store.
  listMembersSignal.value = [...listMembersSignal.value, ...newData];
};
