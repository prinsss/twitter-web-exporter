import {
  TimelineAddEntriesInstruction,
  TimelineEntry,
  TimelineInstructions,
  TimelineTimelineItem,
  TimelineTimelineModule,
  TimelineTweet,
  TimelineUser,
  Tweet,
  User,
} from '@/types';
import logger from './logger';

/**
 * A generic function to extract data from the API response.
 *
 * @param response The XHR object.
 * @param extractInstructionsFromJson Get "TimelineAddEntries" instructions from the JSON object.
 * @param extractDataFromTimelineEntry Get user/tweet data from the timeline entry.
 * @param onNewDataReceived Returns the extracted data.
 */
export function extractDataFromResponse<
  R,
  T extends User | Tweet,
  P extends TimelineUser | TimelineTweet = T extends User ? TimelineUser : TimelineTweet,
>(
  response: XMLHttpRequest,
  extractInstructionsFromJson: (json: R) => TimelineInstructions,
  extractDataFromTimelineEntry: (entry: TimelineEntry<P, TimelineTimelineItem<P>>) => T | undefined,
): T[] {
  try {
    const json: R = JSON.parse(response.responseText);
    const instructions = extractInstructionsFromJson(json);

    const timelineAddEntriesInstruction = instructions.find(
      (i) => i.type === 'TimelineAddEntries',
    ) as TimelineAddEntriesInstruction<P>;

    const newData: T[] = [];

    for (const entry of timelineAddEntriesInstruction.entries) {
      if (isTimelineEntryItem<P>(entry)) {
        const data = extractDataFromTimelineEntry(entry);
        if (data) {
          newData.push(data);
        }
      }
    }

    return newData;
  } catch (err) {
    logger.errorWithBanner('Failed to parse API response.', err as Error);
    return [];
  }
}

/**
 * Tweets with visibility limitation have an additional layer of nesting.
 * Extract the real tweet object from the wrapper.
 */
export function extractTweetWithVisibility(itemContent: TimelineTweet): Tweet {
  const result = itemContent.tweet_results.result;

  if (result.__typename === 'TweetWithVisibilityResults') {
    return result.tweet;
  }

  return result;
}

/*
|--------------------------------------------------------------------------
| Type predicates.
|
| Use these functions to narrow down the type of timeline entries.
|--------------------------------------------------------------------------
*/

export function isTimelineEntryItem<T extends TimelineTweet | TimelineUser>(
  entry: TimelineEntry,
): entry is TimelineEntry<T, TimelineTimelineItem<T>> {
  return entry.content.entryType === 'TimelineTimelineItem';
}

export function isTimelineEntryTweet(
  entry: TimelineEntry,
): entry is TimelineEntry<TimelineTweet, TimelineTimelineItem<TimelineTweet>> {
  return (
    isTimelineEntryItem<TimelineTweet>(entry) &&
    entry.entryId.startsWith('tweet-') &&
    entry.content.itemContent.__typename === 'TimelineTweet'
  );
}

export function isTimelineEntryUser(
  entry: TimelineEntry,
): entry is TimelineEntry<TimelineUser, TimelineTimelineItem<TimelineUser>> {
  return (
    isTimelineEntryItem<TimelineUser>(entry) &&
    entry.entryId.startsWith('user-') &&
    entry.content.itemContent.__typename === 'TimelineUser'
  );
}

export function isTimelineEntryModule<T extends TimelineTweet | TimelineUser>(
  entry: TimelineEntry,
): entry is TimelineEntry<T, TimelineTimelineModule<T>> {
  return entry.content.entryType === 'TimelineTimelineModule';
}

export function isTimelineEntryConversationThread(
  entry: TimelineEntry,
): entry is TimelineEntry<TimelineTweet, TimelineTimelineModule<TimelineTweet>> {
  return (
    isTimelineEntryModule<TimelineTweet>(entry) &&
    entry.entryId.startsWith('conversationthread-') &&
    Array.isArray(entry.content.items)
  );
}

export function isTimelineEntryProfileConversation(
  entry: TimelineEntry,
): entry is TimelineEntry<TimelineTweet, TimelineTimelineModule<TimelineTweet>> {
  return (
    isTimelineEntryModule<TimelineTweet>(entry) &&
    entry.entryId.startsWith('profile-conversation-') &&
    Array.isArray(entry.content.items)
  );
}
