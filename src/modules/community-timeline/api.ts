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
  isTimelineEntryCommunitiesGrid,
  isTimelineEntryItem,
} from '@/utils/api';
import logger from '@/utils/logger';

interface CommunityTimelineResponse {
  data: {
    communityResults: {
      result: {
        __typename: 'Community';
        ranked_community_timeline: {
          timeline: {
            instructions: TimelineInstructions;
          };
        };
        community_media_timeline: {
          timeline: {
            instructions: TimelineInstructions;
          };
        };
      };
    };
  };
}

// https://twitter.com/i/api/graphql/9guIf-LGAtpDbmM87ErE5A/CommunityTweetsTimeline
// https://twitter.com/i/api/graphql/aCiS_8DM0muPEOJ2s7ZJ0Q/CommunityMediaTimeline
export const CommunityTimelineInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/Community(Tweets|Media)Timeline/.test(req.url)) {
    return;
  }

  try {
    const json: CommunityTimelineResponse = JSON.parse(res.responseText);
    const result = json.data.communityResults.result;
    const timeline = result.ranked_community_timeline ?? result.community_media_timeline;
    const instructions = timeline.timeline.instructions;

    const newData: Tweet[] = [];

    // #region Community Tweets
    const timelineAddEntriesInstruction = instructions.find(
      (i) => i.type === 'TimelineAddEntries',
    ) as TimelineAddEntriesInstruction<TimelineTweet>;

    // The "TimelineAddEntries" instruction may not exist in some cases.
    const timelineAddEntriesInstructionEntries = timelineAddEntriesInstruction?.entries ?? [];

    for (const entry of timelineAddEntriesInstructionEntries) {
      if (isTimelineEntryItem<TimelineTweet>(entry)) {
        const tweet = extractTimelineTweet(entry.content.itemContent);
        if (tweet) {
          newData.push(tweet);
        }
      }
      // For media timeline, tweets are sometimes inside the "CommunitiesGrid" entry.
      if (isTimelineEntryCommunitiesGrid(entry)) {
        const tweetsInGrid = entry.content.items
          .map((i) => extractTimelineTweet(i.item.itemContent))
          .filter((t): t is Tweet => !!t);

        newData.push(...tweetsInGrid);
      }
    }

    // #region Community Media
    const timelineAddToModuleInstruction = instructions.find(
      (i) => i.type === 'TimelineAddToModule',
    ) as TimelineAddToModuleInstruction<TimelineTweet>;

    if (timelineAddToModuleInstruction?.moduleItems) {
      const tweets = timelineAddToModuleInstruction.moduleItems
        .map((i) => extractTimelineTweet(i.item.itemContent))
        .filter((t): t is Tweet => !!t);

      newData.push(...tweets);
    }

    // Add captured data to the database.
    db.extAddTweets(ext.name, newData);

    logger.info(`CommunityTimeline: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('CommunityTimeline: Failed to parse API response', err as Error);
  }
};
