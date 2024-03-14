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
  if (!/\/graphql\/.+\/ListMembers/.test(req.url)) {
    return;
  }

  try {
    const newData = extractDataFromResponse<ListMembersResponse, User>(
      res,
      (json) => json.data.list.members_timeline.timeline.instructions,
      (entry) => entry.content.itemContent.user_results.result,
    );

    // Add captured data to the global store.
    listMembersSignal.value = [...listMembersSignal.value, ...newData];

    logger.info(`ListMembers: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('ListMembers: Failed to parse API response', err as Error);
  }
};
