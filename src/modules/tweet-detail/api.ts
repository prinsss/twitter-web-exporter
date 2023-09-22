import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
import {
  TimelineAddEntriesInstruction,
  TimelineAddToModuleInstruction,
  TimelineInstructions,
  TimelineTweet,
  Tweet,
} from '@/types';
import {
  extractTweetWithVisibility,
  isTimelineEntryConversationThread,
  isTimelineEntryTweet,
} from '@/utils/api';
import logger from '@/utils/logger';

/**
 * The global store for "TweetDetail".
 */
export const tweetDetailSignal = signal<Tweet[]>([]);

interface TweetDetailResponse {
  data: {
    threaded_conversation_with_injections_v2: {
      instructions: TimelineInstructions;
    };
  };
}

// https://twitter.com/i/api/graphql/8sK2MBRZY9z-fgmdNpR3LA/TweetDetail
export const TweetDetailInterceptor: Interceptor = (req, res) => {
  if (!/api\/graphql\/.+\/TweetDetail/.test(req.url)) {
    return;
  }

  try {
    const json: TweetDetailResponse = JSON.parse(res.responseText);
    const instructions = json.data.threaded_conversation_with_injections_v2.instructions;

    const newData: Tweet[] = [];

    const timelineAddEntriesInstruction = instructions.find(
      (i) => i.type === 'TimelineAddEntries',
    ) as TimelineAddEntriesInstruction<TimelineTweet>;

    // When loading more tweets in conversation, the "TimelineAddEntries" instruction may not exist.
    const timelineAddEntriesInstructionEntries = timelineAddEntriesInstruction?.entries ?? [];

    for (const entry of timelineAddEntriesInstructionEntries) {
      // The main tweet.
      if (isTimelineEntryTweet(entry)) {
        newData.push(extractTweetWithVisibility(entry.content.itemContent));
      }

      // The conversation thread.
      if (isTimelineEntryConversationThread(entry)) {
        // Be careful about the "conversationthread-{id}-cursor-showmore-{cid}" item.
        const tweetsInConversation = entry.content.items.map((i) => {
          if (i.entryId.includes('-tweet-')) {
            return extractTweetWithVisibility(i.item.itemContent);
          }
        });

        newData.push(...tweetsInConversation.filter((t): t is Tweet => !!t));
      }
    }

    // Lazy-loaded conversations.
    const timelineAddToModuleInstruction = instructions.find(
      (i) => i.type === 'TimelineAddToModule',
    ) as TimelineAddToModuleInstruction<TimelineTweet>;

    if (timelineAddToModuleInstruction) {
      const tweetsInConversation = timelineAddToModuleInstruction.moduleItems.map((i) =>
        extractTweetWithVisibility(i.item.itemContent),
      );

      newData.push(...tweetsInConversation);
    }

    // Add captured tweets to the global store.
    tweetDetailSignal.value = [...tweetDetailSignal.value, ...newData];

    logger.info(`TweetDetail: ${newData.length} items received`);
  } catch (err) {
    logger.errorWithBanner('TweetDetail: Failed to parse API response.', err as Error);
  }
};
