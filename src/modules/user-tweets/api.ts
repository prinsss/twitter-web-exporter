import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
import logger from '@/utils/logger';
import {
  TimelineTweet,
  TimelineAddEntriesInstruction,
  TimelineInstructions,
  TimelinePinEntryInstruction,
  Tweet,
} from '@/types';
import {
  extractTweetWithVisibility,
  isTimelineEntryProfileConversation,
  isTimelineEntryTweet,
} from '@/utils/api';

// The global store for "UserTweets".
export const userTweetsSignal = signal<Tweet[]>([]);

interface UserTweetsResponse {
  data: {
    user: {
      result: {
        timeline_v2: {
          timeline: {
            instructions: TimelineInstructions;
            metadata: unknown;
          };
        };
        __typename: 'User';
      };
    };
  };
}

// https://twitter.com/i/api/graphql/H8OOoI-5ZE4NxgRr8lfyWg/UserTweets
// https://twitter.com/i/api/graphql/Q6aAvPw7azXZbqXzuqTALA/UserTweetsAndReplies
export const UserTweetsInterceptor: Interceptor = (req, res) => {
  if (!/api\/graphql\/.+\/UserTweets/.test(req.url)) {
    return;
  }

  try {
    const json: UserTweetsResponse = JSON.parse(res.responseText);
    const instructions = json.data.user.result.timeline_v2.timeline.instructions;

    const newData: Tweet[] = [];

    // The pinned tweet.
    const timelinePinEntryInstruction = instructions.find(
      (i) => i.type === 'TimelinePinEntry',
    ) as TimelinePinEntryInstruction;

    if (timelinePinEntryInstruction) {
      newData.push(
        extractTweetWithVisibility(timelinePinEntryInstruction.entry.content.itemContent),
      );
    }

    // Normal tweets.
    const timelineAddEntriesInstruction = instructions.find(
      (i) => i.type === 'TimelineAddEntries',
    ) as TimelineAddEntriesInstruction<TimelineTweet>;

    for (const entry of timelineAddEntriesInstruction.entries) {
      // Extract normal tweets.
      if (isTimelineEntryTweet(entry)) {
        newData.push(extractTweetWithVisibility(entry.content.itemContent));
      }

      // Extract conversations.
      if (isTimelineEntryProfileConversation(entry)) {
        const tweetsInConversation = entry.content.items.map((i) =>
          extractTweetWithVisibility(i.item.itemContent),
        );

        newData.push(...tweetsInConversation);
      }
    }

    // Add captured tweets to the global store.
    userTweetsSignal.value = [...userTweetsSignal.value, ...newData];

    logger.info(`UserTweets: ${newData.length} items received`);
  } catch (err) {
    logger.errorWithBanner('UserTweets: Failed to parse API response.', err as Error);
  }
};
