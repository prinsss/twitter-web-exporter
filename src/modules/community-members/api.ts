import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import { User } from '@/types';
import logger from '@/utils/logger';

interface CommunityMembersResponse {
  data: {
    communityResults: {
      result: {
        __typename: 'Community';
        members_slice: {
          items_results: {
            result: User;
          }[];
        };
        moderators_slice: {
          items_results: {
            result: User;
          }[];
        };
      };
    };
  };
}

// https://twitter.com/i/api/graphql/gwNDrhzDr9kuoulEqgSQcQ/membersSliceTimeline_Query
// https://twitter.com/i/api/graphql/hIHwUEnebpLYLqFyZKGbPQ/moderatorsSliceTimeline_Query
export const CommunityMembersInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/(members|moderators)SliceTimeline_Query/.test(req.url)) {
    return;
  }

  try {
    const json: CommunityMembersResponse = JSON.parse(res.responseText);
    const result = json.data.communityResults.result;
    const newData = (result.members_slice ?? result.moderators_slice).items_results
      .map((item) => item.result)
      .filter((user): user is User => user.__typename === 'User');

    // Add captured data to the database.
    db.extAddUsers(ext.name, newData);

    logger.info(`CommunityMembers: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('CommunityMembers: Failed to parse API response', err as Error);
  }
};
