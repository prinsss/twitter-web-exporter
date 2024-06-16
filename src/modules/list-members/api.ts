import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import { TimelineInstructions, User } from '@/types';
import { extractDataFromResponse, extractTimelineUser } from '@/utils/api';
import logger from '@/utils/logger';

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
export const ListMembersInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/ListMembers/.test(req.url)) {
    return;
  }

  try {
    const newData = extractDataFromResponse<ListMembersResponse, User>(
      res,
      (json) => json.data.list.members_timeline.timeline.instructions,
      (entry) => extractTimelineUser(entry.content.itemContent),
    );

    // Add captured data to the database.
    db.extAddUsers(ext.name, newData);

    logger.info(`ListMembers: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('ListMembers: Failed to parse API response', err as Error);
  }
};
