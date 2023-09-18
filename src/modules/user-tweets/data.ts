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

// Deal with tweets with visibility limitation.
function extractTweetWithVisibility(itemContent: TimelineTweet): Tweet {
  const result = itemContent.tweet_results.result;

  if (result.__typename === 'TweetWithVisibilityResults') {
    return result.tweet;
  }

  return result;
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

    const newTweets: Tweet[] = [];

    // The pinned tweet.
    const timelinePinEntryInstruction = instructions.find(
      (i) => i.type === 'TimelinePinEntry'
    ) as TimelinePinEntryInstruction;

    if (timelinePinEntryInstruction) {
      newTweets.push(
        extractTweetWithVisibility(timelinePinEntryInstruction.entry.content.itemContent)
      );
    }

    // Normal tweets.
    const timelineAddEntriesInstruction = instructions.find(
      (i) => i.type === 'TimelineAddEntries'
    ) as TimelineAddEntriesInstruction<TimelineTweet>;

    for (const entry of timelineAddEntriesInstruction.entries) {
      // Ignore timeline cursors.
      if (entry.content.entryType === 'TimelineTimelineCursor') {
        logger.debug('skip TimelineTimelineCursor');
        continue;
      }

      // Extract conversations.
      if (
        entry.content.entryType === 'TimelineTimelineModule' &&
        entry.content.metadata?.conversationMetadata
      ) {
        const tweetsInConversation = entry.content.items.map((i) =>
          extractTweetWithVisibility(i.item.itemContent as TimelineTweet)
        );

        logger.debug('conversation', tweetsInConversation);
        newTweets.push(...tweetsInConversation);
      }

      // Extract normal tweets.
      if (entry.content.entryType === 'TimelineTimelineItem') {
        logger.debug('normal tweets', entry.content.itemContent);
        newTweets.push(extractTweetWithVisibility(entry.content.itemContent));
      }
    }

    // Add captured tweets to the global store.
    userTweetsSignal.value = [...userTweetsSignal.value, ...newTweets];
  } catch (err) {
    logger.error((err as Error).message);
  }
};
