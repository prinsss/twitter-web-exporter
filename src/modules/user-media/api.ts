import { Interceptor } from '@/core/extensions';
import { db } from '@/core/database';
import {
  TimelineAddEntriesInstruction,
  TimelineAddToModuleInstruction,
  TimelineInstructions,
  TimelineTweet,
  Tweet,
} from '@/types';
import { extractTimelineTweet, isTimelineEntryProfileGrid } from '@/utils/api';
import logger from '@/utils/logger';

interface UserMediaResponse {
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

// https://twitter.com/i/api/graphql/oMVVrI5kt3kOpyHHTTKf5Q/UserMedia
export const UserMediaInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/UserMedia/.test(req.url)) {
    return;
  }

  try {
    const json: UserMediaResponse = JSON.parse(res.responseText);
    const instructions = json.data.user.result.timeline.timeline.instructions;

    const newData: Tweet[] = [];

    // There are two types of instructions: "TimelineAddEntries" and "TimelineAddToModule".
    // For "Media", the "TimelineAddEntries" instruction initializes "profile-grid" module.
    const timelineAddEntriesInstruction = instructions.find(
      (i) => i.type === 'TimelineAddEntries',
    ) as TimelineAddEntriesInstruction<TimelineTweet>;

    // The "TimelineAddEntries" instruction may not exist in some cases.
    const timelineAddEntriesInstructionEntries = timelineAddEntriesInstruction?.entries ?? [];

    for (const entry of timelineAddEntriesInstructionEntries) {
      if (isTimelineEntryProfileGrid(entry)) {
        const tweetsInSearchGrid = entry.content.items
          .map((i) => extractTimelineTweet(i.item.itemContent))
          .filter((t): t is Tweet => !!t);

        newData.push(...tweetsInSearchGrid);
      }
    }

    // The "TimelineAddToModule" instruction then prepends items to existing "profile-grid" module.
    const timelineAddToModuleInstruction = instructions.find(
      (i) => i.type === 'TimelineAddToModule',
    ) as TimelineAddToModuleInstruction<TimelineTweet>;

    if (timelineAddToModuleInstruction) {
      const tweetsInProfileGrid = timelineAddToModuleInstruction.moduleItems
        .map((i) => extractTimelineTweet(i.item.itemContent))
        .filter((t): t is Tweet => !!t);

      newData.push(...tweetsInProfileGrid);
    }

    // Add captured tweets to the database.
    db.extAddTweets(ext.name, newData);

    logger.info(`UserMedia: ${newData.length} items received`);
  } catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText);
    logger.errorWithBanner('UserMedia: Failed to parse API response', err as Error);
  }
};
