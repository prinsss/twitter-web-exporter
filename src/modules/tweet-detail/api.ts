import { signal } from '@preact/signals';
import { Interceptor } from '@/core/extensions';
import { TimelineAddEntriesInstruction, TimelineInstructions, TimelineTweet, Tweet } from '@/types';
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

    for (const entry of timelineAddEntriesInstruction.entries) {
      // The main tweet.
      if (isTimelineEntryTweet(entry)) {
        newData.push(extractTweetWithVisibility(entry.content.itemContent));
      }

      // The conversation thread.
      if (isTimelineEntryConversationThread(entry)) {
        const tweetsInConversation = entry.content.items.map((i) =>
          extractTweetWithVisibility(i.item.itemContent),
        );

        newData.push(...tweetsInConversation);
      }
    }

    logger.info(`TweetDetail: ${newData.length} items received`);

    // Add captured tweets to the global store.
    tweetDetailSignal.value = [...tweetDetailSignal.value, ...newData];
  } catch (err) {
    logger.errorWithBanner('Failed to parse API response.', err as Error);
  }
};
