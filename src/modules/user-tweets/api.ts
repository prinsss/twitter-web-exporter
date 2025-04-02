import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import {
  TimelineAddEntriesInstruction,
  TimelineInstructions,
  TimelinePinEntryInstruction,
  TimelineTweet,
  Tweet,
} from '@/types';
import {
  extractTimelineTweet,
  isTimelineEntryProfileConversation,
  isTimelineEntryTweet,
} from '@/utils/api';
import logger from '@/utils/logger';

interface UserTweetsResponse {
  data: {
    user: {
      result: {
        timeline: {
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
export const UserTweetsInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/UserTweets/.test(req.url)) {
    return;
  }

  try {
    const json: UserTweetsResponse = JSON.parse(res.responseText);
    const instructions = json.data.user.result.timeline.timeline.instructions;

    const newData: Tweet[] = [];

    // The pinned tweet.
    const timelinePinEntryInstruction = instructions.find(
      (i) => i.type === 'TimelinePinEntry',
    ) as TimelinePinEntryInstruction;

    if (timelinePinEntryInstruction) {
      const tweet = extractTimelineTweet(timelinePinEntryInstruction.entry.content.itemContent);
      if (tweet) {
        newData.push(tweet);
      }
    }

    // Normal tweets.
    const timelineAddEntriesInstruction = instructions.find(
      (i) => i.type === 'TimelineAddEntries',
    ) as TimelineAddEntriesInstruction<TimelineTweet>;

    // The "TimelineAddEntries" instruction may not exist in some cases.
    const timelineAddEntriesInstructionEntries = timelineAddEntriesInstruction?.entries ?? [];

    for (const entry of timelineAddEntriesInstructionEntries) {
      // Extract normal tweets.
      if (isTimelineEntryTweet(entry)) {
        const tweet = extractTimelineTweet(entry.content.itemContent);
        if (tweet) {
          newData.push(tweet);
        }
      }

      // Extract conversations.
      if (isTimelineEntryProfileConversation(entry)) {
        const tweetsInConversation = entry.content.items
          .map((i) => extractTimelineTweet(i.item.itemContent))
          .filter((t): t is Tweet => !!t);

        newData.push(...tweetsInConversation);
      }
    }

    // Add captured tweets to the database.
    db.extAddTweets(ext.name, newData);

    logger.info(`UserTweets: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('UserTweets: Failed to parse API response', err as Error);
  }
};
