import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import {
  TimelineAddEntriesInstruction,
  TimelineAddToModuleInstruction,
  TimelineInstructions,
  TimelineTweet,
  Tweet,
} from '@/types';
import {
  extractTimelineTweet,
  isTimelineEntryConversationThread,
  isTimelineEntryTweet,
} from '@/utils/api';
import logger from '@/utils/logger';

interface TweetDetailResponse {
  data: {
    threaded_conversation_with_injections_v2: {
      instructions: TimelineInstructions;
    };
  };
}

interface ModeratedTimelineResponse {
  data: {
    tweet: {
      result: {
        timeline_response: {
          timeline: {
            instructions: TimelineInstructions;
          };
        };
      };
    };
  };
}

// https://twitter.com/i/api/graphql/8sK2MBRZY9z-fgmdNpR3LA/TweetDetail
// https://twitter.com/i/api/graphql/8sK2MBRZY9z-fgmdNpR3LA/ModeratedTimeline
export const TweetDetailInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/(TweetDetail|ModeratedTimeline)/.test(req.url)) {
    return;
  }

  try {
    const json: TweetDetailResponse = JSON.parse(res.responseText);
    let instructions: TimelineInstructions;

    // Determine the endpoint and extract instructions accordingly.
    if (/\/graphql\/.+\/TweetDetail/.test(req.url)) {
      // Handle TweetDetail response.
      const tweetDetailResponse = json as TweetDetailResponse;
      instructions = tweetDetailResponse.data.threaded_conversation_with_injections_v2.instructions;
    } else if (/\/graphql\/.+\/ModeratedTimeline/.test(req.url)) {
      // Handle ModeratedTimeline response.
      const moderatedTimelineResponse = json as ModeratedTimelineResponse;
      instructions = moderatedTimelineResponse.data.tweet.result.timeline_response.timeline.instructions;
    } else {
      return;
    }

    const newData: Tweet[] = [];

    const timelineAddEntriesInstruction = instructions.find(
      (i) => i.type === 'TimelineAddEntries',
    ) as TimelineAddEntriesInstruction<TimelineTweet>;

    // When loading more tweets in conversation, the "TimelineAddEntries" instruction may not exist.
    const timelineAddEntriesInstructionEntries = timelineAddEntriesInstruction?.entries ?? [];

    for (const entry of timelineAddEntriesInstructionEntries) {
      // The main tweet.
      if (isTimelineEntryTweet(entry)) {
        const tweet = extractTimelineTweet(entry.content.itemContent);
        if (tweet) {
          newData.push(tweet);
        }
      }

      // The conversation thread (only for TweetDetail).
      if (/\/graphql\/.+\/TweetDetail/.test(req.url) && isTimelineEntryConversationThread(entry)) {
        // Be careful about the "conversationthread-{id}-cursor-showmore-{cid}" item.
        const tweetsInConversation = entry.content.items.map((i) => {
          if (i.entryId.includes('-tweet-')) {
            return extractTimelineTweet(i.item.itemContent);
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
      const tweetsInConversation = timelineAddToModuleInstruction.moduleItems
        .map((i) => extractTimelineTweet(i.item.itemContent))
        .filter((t): t is Tweet => !!t);

      newData.push(...tweetsInConversation);
    }

    // Add captured tweets to the database.
    db.extAddTweets(ext.name, newData);

    // Log the number of items received.
    if (/\/graphql\/.+\/TweetDetail/.test(req.url)) {
      logger.info(`TweetDetail: ${newData.length} items received`);
    } else if (/\/graphql\/.+\/ModeratedTimeline/.test(req.url)) {
      logger.info(`ModeratedTimeline: ${newData.length} items received`);
    }
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('TweetDetail: Failed to parse API response', err as Error);
  }
};
