import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
import logger from '@/utils/logger';
import { TimelineAddEntriesInstruction, TimelineInstructions, User, TimelineUser } from '@/types';

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
export const FollowersInterceptor: Interceptor = (req, res) => {
  if (!/api\/graphql\/.+\/Followers/.test(req.url)) {
    return;
  }

  try {
    const json: FollowersResponse = JSON.parse(res.responseText);
    const instructions = json.data.user.result.timeline.timeline.instructions;

    const timelineAddEntriesInstruction = instructions.find(
      (i) => i.type === 'TimelineAddEntries',
    ) as TimelineAddEntriesInstruction<TimelineUser>;

    const newUsers: User[] = [];

    for (const entry of timelineAddEntriesInstruction.entries) {
      if (entry.content.entryType === 'TimelineTimelineItem') {
        newUsers.push(entry.content.itemContent.user_results.result);
      }
    }

    // Add captured users to the global store.
    followersSignal.value = [...followersSignal.value, ...newUsers];
  } catch (err) {
    logger.errorWithBanner('Failed to parse API response.', err as Error);
  }
};
